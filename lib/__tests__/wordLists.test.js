import { DOLCH_LISTS, STARTER_WORDS } from '../wordLists';

describe('Dolch word lists', () => {
  it('has the five levels with the published counts, 220 words in all', () => {
    expect(DOLCH_LISTS.map((list) => [list.label, list.words.length])).toEqual([
      ['Pre-primer', 40],
      ['Primer', 52],
      ['First grade', 41],
      ['Second grade', 46],
      ['Third grade', 41],
    ]);
    expect(DOLCH_LISTS.reduce((sum, list) => sum + list.words.length, 0)).toBe(220);
  });

  it('puts every word in exactly one level', () => {
    const all = DOLCH_LISTS.flatMap((list) => list.words.map((w) => w.toLowerCase()));
    expect(new Set(all).size).toBe(all.length);
  });

  it('leaves out "left", which one source adds to second grade', () => {
    expect(DOLCH_LISTS.flatMap((list) => list.words)).not.toContain('left');
  });

  it('takes the starter words from the first level', () => {
    const prePrimer = new Set(DOLCH_LISTS[0].words);
    STARTER_WORDS.forEach((word) => expect(prePrimer.has(word)).toBe(true));
  });
});
