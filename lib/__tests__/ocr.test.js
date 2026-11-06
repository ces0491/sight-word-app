// The OCR engine isn't needed to test how its text is turned into words
jest.mock('tesseract.js', () => ({ createWorker: jest.fn() }));

import { validateExtractedWords } from '../ocr';
import { DOLCH_LISTS } from '../wordLists';

describe('validateExtractedWords', () => {
  it('keeps every Dolch word it reads, in order', () => {
    const all = DOLCH_LISTS.flatMap((list) => list.words.map((word) => word.toLowerCase()));
    expect(validateExtractedWords(all.join(' '))).toEqual(all);
  });

  it('keeps one-letter words and words in any case', () => {
    expect(validateExtractedWords('I see A Red ball')).toEqual(['i', 'see', 'a', 'red']);
  });

  it('reads straight and curly apostrophes', () => {
    expect(validateExtractedWords("don't Don’t")).toEqual(["don't"]);
  });

  it('ignores punctuation around words', () => {
    expect(validateExtractedWords('"Look!" said Sam, (here).')).toEqual(['look', 'said', 'here']);
  });

  it('adds only exact matches, so ordinary words are not turned into sight words', () => {
    expect(validateExtractedWords('tree cat dog bird bed')).toEqual([]);
  });

  it('skips misreads and numbers', () => {
    expect(validateExtractedWords('tbe jurnp 42 the')).toEqual(['the']);
  });

  it('lists each word once', () => {
    expect(validateExtractedWords('the cat sat on the mat')).toEqual(['the', 'on']);
  });

  it('returns nothing for no text', () => {
    expect(validateExtractedWords('')).toEqual([]);
    expect(validateExtractedWords(undefined)).toEqual([]);
  });
});
