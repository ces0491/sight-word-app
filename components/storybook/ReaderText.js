import React, { useMemo } from 'react';
import { findWords, matchSightWords } from '../../lib/sightWords';

const FORMAT_CLASS = {
  highlighted: 'mark-highlighted',
  bold: 'mark-bold',
  underlined: 'mark-underlined',
};

/**
 * Split a sentence into its words and the text between them (spaces and
 * punctuation), keeping positions so the word being spoken can be lit up.
 * Words are found with the same rule as sight word counting (lib/sightWords.js).
 * @param {string} sentence
 * @returns {{ text: string, start: number, end: number, core: string, isWord: boolean, wordIndex?: number }[]}
 */
export const tokenizeSentence = (sentence) => {
  const text = typeof sentence === 'string' ? sentence : '';
  const tokens = [];
  let lastIndex = 0;
  findWords(text).forEach((word, wordIndex) => {
    if (word.start > lastIndex) {
      tokens.push({ text: text.slice(lastIndex, word.start), start: lastIndex, end: word.start, core: '', isWord: false });
    }
    tokens.push({ text: word.text, start: word.start, end: word.end, core: word.text, isWord: true, wordIndex });
    lastIndex = word.end;
  });
  if (lastIndex < text.length) {
    tokens.push({ text: text.slice(lastIndex), start: lastIndex, end: text.length, core: '', isWord: false });
  }
  return tokens;
};

/**
 * One page's sentence, large. Each word is a button that reads it aloud;
 * sight words are marked in the story's format; the word being read by
 * "Read to me" is lit up.
 */
const ReaderText = ({ sentence, words = [], format = 'highlighted', onWordTap, spokenIndex = null }) => {
  const tokens = useMemo(() => tokenizeSentence(sentence), [sentence]);
  // Word indexes that are part of a sight word (or phrase)
  const sightIndexes = useMemo(() => {
    const indexes = new Set();
    for (const { first, last } of matchSightWords(findWords(sentence), words)) {
      for (let i = first; i <= last; i++) indexes.add(i);
    }
    return indexes;
  }, [sentence, words]);
  // Speech boundary events can land on punctuation before a word, so light the next word
  const spokenWord = useMemo(
    () => (spokenIndex === null ? null : tokens.find((t) => t.isWord && t.end > spokenIndex)?.wordIndex ?? null),
    [tokens, spokenIndex]
  );
  const markClass = FORMAT_CLASS[format] ?? '';

  return (
    <p className="reader-text text-ink">
      {tokens.map((token) => {
        if (!token.isWord) return <React.Fragment key={token.start}>{token.text}</React.Fragment>;
        const isSight = sightIndexes.has(token.wordIndex);
        const isSpoken = token.wordIndex === spokenWord;
        const className = ['reader-word', isSight ? `is-sight ${markClass}` : '', isSpoken ? 'is-spoken' : '']
          .filter(Boolean)
          .join(' ');
        if (!onWordTap) {
          return (
            <span key={token.start} className={className}>
              {token.text}
            </span>
          );
        }
        return (
          <button
            key={token.start}
            type="button"
            className={`${className} cursor-pointer align-baseline`}
            onClick={() => onWordTap(token.core)}
          >
            {token.text}
          </button>
        );
      })}
    </p>
  );
};

export default ReaderText;
