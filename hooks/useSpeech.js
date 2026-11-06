import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

/** A slightly slow, clear pace for children learning to read. */
const CHILD_RATE = 0.85;

const isSpeechAvailable = () =>
  typeof window !== 'undefined' &&
  'speechSynthesis' in window &&
  typeof window.SpeechSynthesisUtterance === 'function';

// Speech support doesn't change while the page is open, so there is nothing to subscribe to
const noSubscription = () => () => {};

/** Prefer an English voice that runs on the device, then any English voice. */
const pickVoice = (voices) =>
  voices.find((v) => v.lang?.toLowerCase().startsWith('en') && v.localService) ??
  voices.find((v) => v.lang?.toLowerCase().startsWith('en')) ??
  null;

/**
 * Read text aloud with the browser's built-in speech synthesis.
 *
 * `charIndex` is the position of the word being spoken when `speak` was
 * called with `trackWords: true`, for highlighting it. Browsers that don't
 * report word boundaries still speak; they just don't highlight.
 */
export function useSpeech() {
  // False on the server and while hydrating, then the browser's answer
  const supported = useSyncExternalStore(noSubscription, isSpeechAvailable, () => false);
  const [speaking, setSpeaking] = useState(false);
  const [charIndex, setCharIndex] = useState(null);
  const voiceRef = useRef(null);

  useEffect(() => {
    if (!isSpeechAvailable()) return undefined;
    const synth = window.speechSynthesis;

    const updateVoice = () => {
      voiceRef.current = pickVoice(synth.getVoices());
    };
    updateVoice();
    synth.addEventListener?.('voiceschanged', updateVoice);

    return () => {
      synth.removeEventListener?.('voiceschanged', updateVoice);
      synth.cancel();
    };
  }, []);

  // The utterance being spoken; events from one that was cancelled are ignored
  const currentRef = useRef(null);

  const stop = useCallback(() => {
    if (!isSpeechAvailable()) return;
    currentRef.current = null;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setCharIndex(null);
  }, []);

  const speak = useCallback((text, { trackWords = false } = {}) => {
    if (!isSpeechAvailable() || !text) return;
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new window.SpeechSynthesisUtterance(text);
    currentRef.current = utterance;
    const isCurrent = () => currentRef.current === utterance;
    utterance.rate = CHILD_RATE;
    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
      utterance.lang = voiceRef.current.lang;
    } else {
      utterance.lang = 'en-US';
    }
    if (trackWords) {
      utterance.onboundary = (event) => {
        if (isCurrent() && (!event.name || event.name === 'word')) setCharIndex(event.charIndex);
      };
    }
    utterance.onstart = () => {
      if (isCurrent()) setSpeaking(true);
    };
    // Cancelling one utterance to start the next can deliver its end event late
    utterance.onend = () => {
      if (!isCurrent()) return;
      currentRef.current = null;
      setSpeaking(false);
      setCharIndex(null);
    };
    utterance.onerror = utterance.onend;

    setCharIndex(trackWords ? 0 : null);
    synth.speak(utterance);
  }, []);

  return { supported, speaking, charIndex, speak, stop };
}

export default useSpeech;
