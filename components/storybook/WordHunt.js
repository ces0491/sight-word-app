import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Star, Volume2, Eye, RotateCcw } from 'lucide-react';
import WordCard from './WordCard';
import { DOLCH_LISTS } from '../../lib/wordLists';

const MAX_ROUNDS = 5;
const CHOICES = 3;
const NEXT_ROUND_DELAY_MS = 900;

const shuffleList = (list) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const uniqueLower = (words) => [...new Set(words.filter(Boolean).map((w) => w.toLowerCase()))];

/**
 * Build the rounds: each has a target word and the cards to choose from.
 * Wrong choices come from the story's other words, topped up from the
 * first Dolch list when a story has few words.
 * @param {string[]} words
 * @returns {{ target: string, choices: string[] }[]}
 */
export const buildRounds = (words) => {
  const targets = shuffleList(uniqueLower(words)).slice(0, MAX_ROUNDS);
  const fillers = uniqueLower(DOLCH_LISTS[0].words);
  return targets.map((target) => {
    const pool = uniqueLower([...words, ...fillers]).filter((w) => w !== target);
    const others = shuffleList(pool).slice(0, CHOICES - 1);
    return { target, choices: shuffleList([target, ...others]) };
  });
};

/**
 * "Word hunt": hear a word (or see it, where the device can't speak) and
 * find its card. Each word found earns a star.
 */
const WordHunt = ({ words, speech, onDone }) => {
  const [rounds, setRounds] = useState(() => buildRounds(words));
  const [roundIndex, setRoundIndex] = useState(0);
  const [missed, setMissed] = useState([]);
  const [found, setFound] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const [wobble, setWobble] = useState(null);

  const round = rounds[roundIndex];
  const finished = roundIndex >= rounds.length;
  const { speak, supported } = speech;
  // Without speech the game is matching, so the word is always shown
  const showWord = !supported || hintShown;

  const sayTarget = useCallback(() => {
    if (round) speak(round.target);
  }, [round, speak]);

  // Say each new word as its round starts
  useEffect(() => {
    if (!finished && supported) sayTarget();
  }, [roundIndex, finished, supported, sayTarget]);

  const choose = (word) => {
    if (found || !round) return;
    if (word === round.target) {
      setFound(true);
      speak(word);
      setTimeout(() => {
        setFound(false);
        setMissed([]);
        setHintShown(false);
        setRoundIndex((i) => i + 1);
      }, NEXT_ROUND_DELAY_MS);
    } else {
      setMissed((m) => [...m, word]);
      setWobble(word);
      speak(word);
    }
  };

  const playAgain = () => {
    setRounds(buildRounds(words));
    setRoundIndex(0);
    setMissed([]);
    setFound(false);
    setHintShown(false);
  };

  if (rounds.length === 0) return null;

  const stars = (
    <div className="flex justify-center gap-2" aria-label={`${Math.min(roundIndex, rounds.length)} of ${rounds.length} stars`}>
      {rounds.map((r, i) => (
        <Star
          key={r.target}
          size={36}
          strokeWidth={2.5}
          className={i < roundIndex ? 'animate-pop fill-berry text-ink' : 'fill-paper text-ink/30'}
          aria-hidden="true"
        />
      ))}
    </div>
  );

  if (finished) {
    return (
      <section className="mx-auto max-w-xl space-y-6 text-center" aria-labelledby="hunt-title">
        {stars}
        <h2 id="hunt-title" className="animate-rise font-display text-4xl font-bold text-ink sm:text-5xl">
          You found them all!
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={playAgain} className="btn btn-sun">
            <RotateCcw size={22} strokeWidth={2.5} aria-hidden="true" /> Play again
          </button>
          <button type="button" onClick={onDone} className="btn btn-paper">
            Done
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl space-y-8 text-center" aria-labelledby="hunt-title">
      {stars}
      <div className="space-y-4">
        <h2 id="hunt-title" className="font-display text-3xl font-bold text-ink sm:text-4xl">
          {supported ? 'Find the word you hear' : 'Find this word'}
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {supported && (
            <button type="button" onClick={sayTarget} className="btn btn-sun btn-big">
              <Volume2 size={30} strokeWidth={2.5} aria-hidden="true" /> Hear it
            </button>
          )}
          {showWord ? (
            <WordCard word={round.target} index={roundIndex} size="md" />
          ) : (
            <button type="button" onClick={() => setHintShown(true)} className="btn btn-paper">
              <Eye size={22} strokeWidth={2.5} aria-hidden="true" /> Show me
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-5" role="group" aria-label="Word cards">
        {round.choices.map((word, i) => (
          <div key={`${roundIndex}-${word}`} className={wobble === word ? 'animate-wobble' : ''} onAnimationEnd={() => setWobble(null)}>
            <WordCard
              word={word}
              index={i + roundIndex}
              size="lg"
              state={found && word === round.target ? 'found' : missed.includes(word) ? 'missed' : undefined}
              onClick={() => choose(word)}
              label={word}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default WordHunt;
