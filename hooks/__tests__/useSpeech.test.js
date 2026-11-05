import { act, renderHook } from '@testing-library/react';
import { useSpeech } from '../useSpeech';
import { installSpeechMock } from '../../test/speechMock';

describe('useSpeech', () => {
  it('reports no support when the browser has no speech synthesis', () => {
    const { result } = renderHook(() => useSpeech());

    expect(result.current.supported).toBe(false);
    expect(() => result.current.speak('hello')).not.toThrow();
  });

  describe('with speech synthesis', () => {
    let speech;
    beforeEach(() => {
      speech = installSpeechMock();
    });
    afterEach(() => {
      speech.uninstall();
    });

    it('speaks slowly, in English, and tracks the word being spoken', () => {
      const { result } = renderHook(() => useSpeech());
      expect(result.current.supported).toBe(true);

      act(() => result.current.speak('The dog ran.', { trackWords: true }));
      const utterance = speech.spoken.at(-1);
      expect(utterance.rate).toBeLessThan(1);
      expect(utterance.lang).toBe('en-US');
      expect(result.current.speaking).toBe(true);

      act(() => speech.boundary(4));
      expect(result.current.charIndex).toBe(4);

      act(() => speech.finish());
      expect(result.current.speaking).toBe(false);
      expect(result.current.charIndex).toBeNull();
    });

    it('cancels what it was saying before speaking again', () => {
      const { result } = renderHook(() => useSpeech());

      act(() => result.current.speak('one'));
      speech.synth.cancel.mockClear();
      act(() => result.current.speak('two'));

      expect(speech.synth.cancel).toHaveBeenCalled();
      expect(speech.spoken.at(-1).text).toBe('two');
    });

    it('stops speaking when unmounted', () => {
      const { unmount } = renderHook(() => useSpeech());
      speech.synth.cancel.mockClear();

      unmount();

      expect(speech.synth.cancel).toHaveBeenCalled();
    });
  });
});
