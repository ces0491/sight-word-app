import React, { useMemo } from 'react';

const FORMAT_CLASS = {
  highlighted: 'mark-highlighted',
  bold: 'mark-bold',
  underlined: 'mark-underlined',
};

/**
 * Split a sentence into words and the spaces between them, keeping each
 * word's position so the word being spoken can be lit up.
 * @param {string} sentence
 * @returns {{ text: string, start: number, end: number, core: string, isWord: boolean }[]}
 */
export const tokenizeSentence = (sentence) => {
  const tokens = [];
  const text = typeof sentence === 'string' ? sentence : '';
  const pattern = /\S+|\s+/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const value = match[0];
    const isWord = /\S/.test(value);
    // The word without surrounding punctuation, for speaking and matching
    const core = isWord ? value.replace(/^[^\p{L}\p{N}']+|[^\p{L}\p{N}']+$/gu, '') : '';
    tokens.push({ text: value, start: match.index, end: match.index + value.length, core, isWord: isWord && core.length > 0 });
  }
  return tokens;
};

/**
 * One page's sentence, large. Each word is a button that reads it aloud;
 * sight words are marked in the story's format; the word being read by
 * "Read to me" is lit up.
 */
const ReaderText = ({ sentence, words = [], format = 'highlighted', onWordTap, spokenIndex = null }) => {
  const sightWords = useMemo(() => new Set(words.map((w) => w.toLowerCase())), [words]);
  const tokens = useMemo(() => tokenizeSentence(sentence), [sentence]);
  const markClass = FORMAT_CLASS[format] ?? '';

  return (
    <p className="reader-text text-ink">
      {tokens.map((token) => {
        if (!token.isWord) return <React.Fragment key={token.start}>{token.text}</React.Fragment>;
        const isSight = sightWords.has(token.core.toLowerCase());
        const isSpoken = spokenIndex !== null && spokenIndex >= token.start && spokenIndex < token.end;
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
