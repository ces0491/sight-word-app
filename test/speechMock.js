/**
 * A stand-in for the browser's speech synthesis, for tests.
 * `spoken` records each utterance; `finish()` ends the current one.
 */
export function installSpeechMock() {
  const spoken = [];
  let current = null;

  class Utterance {
    constructor(text) {
      this.text = text;
      this.rate = 1;
      this.onstart = null;
      this.onend = null;
      this.onerror = null;
      this.onboundary = null;
    }
  }

  const synth = {
    speak: jest.fn((utterance) => {
      current = utterance;
      spoken.push(utterance);
      utterance.onstart?.();
    }),
    cancel: jest.fn(() => {
      current = null;
    }),
    getVoices: () => [{ lang: 'en-US', localService: true, name: 'Test voice' }],
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };

  window.speechSynthesis = synth;
  window.SpeechSynthesisUtterance = Utterance;

  return {
    synth,
    spoken,
    /** Fire a word boundary at a character index on the current utterance. */
    boundary: (charIndex) => current?.onboundary?.({ name: 'word', charIndex }),
    finish: () => {
      const utterance = current;
      current = null;
      utterance?.onend?.();
    },
    uninstall: () => {
      delete window.speechSynthesis;
      delete window.SpeechSynthesisUtterance;
    },
  };
}
