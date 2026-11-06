import React from 'react';
import { X } from 'lucide-react';

const TINTS = ['bg-card-sun', 'bg-card-mint', 'bg-card-pink', 'bg-card-blue', 'bg-card-lilac'];

/** Card colour for the nth word, so neighbouring cards differ. */
export const tintFor = (index) => TINTS[index % TINTS.length];

/** A slight hand-placed tilt for cards on the shelf. */
const TILTS = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', 'rotate-0'];

const SIZES = {
  lg: 'min-w-26 px-6 py-4 text-4xl sm:text-5xl border-3 shadow-cutout',
  md: 'min-w-24 px-5 py-3 text-3xl sm:text-4xl border-3 shadow-cutout',
  sm: 'px-3 py-1 text-xl border-2 shadow-cutout-sm',
};

/**
 * A chunky word card, like a cut-out flash card.
 *
 * - With `onSay`, the card is a button that reads the word aloud.
 * - With `onRemove`, a small × removes it (grown-up word lists).
 * - `state` marks a card in the word hunt: 'found' or 'missed'.
 */
const WordCard = ({ word, index = 0, size = 'lg', tilt = false, onSay, onRemove, state, onClick, label }) => {
  const stateClass =
    state === 'found' ? 'bg-leaf text-white' : state === 'missed' ? 'opacity-40' : tintFor(index);
  const shape = `relative inline-flex items-center justify-center rounded-2xl border-ink font-read font-bold leading-none text-ink ${SIZES[size]} ${stateClass} ${tilt ? TILTS[index % TILTS.length] : ''}`;
  const press = 'transition-transform duration-100 active:translate-x-1 active:translate-y-1 active:shadow-none';

  const handleClick = onClick ?? (onSay ? () => onSay(word) : undefined);

  if (onRemove) {
    return (
      <span className={`${shape} gap-2 pr-1`}>
        <span>{word}</span>
        <button
          type="button"
          onClick={() => onRemove(word)}
          className="grid h-7 w-7 place-items-center rounded-full text-ink/70 hover:bg-ink/10 hover:text-ink"
          aria-label={`Remove ${word}`}
        >
          <X size={16} strokeWidth={3} aria-hidden="true" />
        </button>
      </span>
    );
  }

  if (handleClick) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`${shape} ${press}`}
        aria-label={label ?? `Hear the word ${word}`}
      >
        {word}
      </button>
    );
  }

  return <span className={shape}>{word}</span>;
};

export default WordCard;
