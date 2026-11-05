import React, { useState } from 'react';
import Modal from './Modal';

const STORAGE_KEY = 'sight-words:grown-up-checked';

/** Has a grown-up answered the sum in this browser tab? */
export const grownUpChecked = () => {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === 'yes';
  } catch {
    return false;
  }
};

const rememberGrownUp = () => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, 'yes');
  } catch {
    // Storage can be unavailable (private mode); the sum is asked again next time.
  }
};

/** Two numbers from 4 to 9, so the sum is beyond most early readers. */
const newSum = () => {
  const pickNumber = () => 4 + Math.floor(Math.random() * 6);
  return [pickNumber(), pickNumber()];
};

/**
 * A simple check that keeps children out of the grown-ups area:
 * answer a sum. Passing is remembered for the rest of the browser tab.
 */
const ParentGate = ({ onPass, onClose }) => {
  const [[a, b], setSum] = useState(newSum);
  const [answer, setAnswer] = useState('');
  const [wrong, setWrong] = useState(false);

  const check = (event) => {
    event.preventDefault();
    if (Number(answer.trim()) === a + b) {
      rememberGrownUp();
      onPass();
      return;
    }
    setWrong(true);
    setAnswer('');
    setSum(newSum());
  };

  return (
    <Modal title="Grown-ups only" onClose={onClose} labelledBy="parent-gate-title">
      <form onSubmit={check} className="space-y-4">
        <label htmlFor="parent-gate-answer" className="block font-display text-lg text-ink">
          What is {a} + {b}?
        </label>
        <input
          id="parent-gate-answer"
          inputMode="numeric"
          autoComplete="off"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          className="field text-2xl"
          aria-describedby={wrong ? 'parent-gate-error' : undefined}
        />
        {wrong && (
          <p id="parent-gate-error" className="font-display text-base text-berry" role="alert">
            That&apos;s not it. Try this one.
          </p>
        )}
        <button type="submit" className="btn btn-sun w-full">
          Open grown-ups
        </button>
      </form>
    </Modal>
  );
};

export default ParentGate;
