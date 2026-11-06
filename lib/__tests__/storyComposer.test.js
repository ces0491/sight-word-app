import { composeStory } from '../storyComposer';
import { generateStory } from '../storyGeneration';
import { sceneLibrary } from '../storyScenes';
import { EXTRA_SENTENCES, MAX_EXTRA_SENTENCES } from '../extraSentences';
import { findUsedWords } from '../sightWords';
import { DOLCH_LISTS } from '../wordLists';

const ALL_DOLCH = DOLCH_LISTS.flatMap((list) => list.words.map((word) => word.toLowerCase()));
const SCENES = Object.fromEntries(sceneLibrary.map((scene) => [scene.id, scene]));

/** Every scene's needs are met by a scene earlier in the story. */
const assertIntroductionsComeFirst = (scenesUsed) => {
  const given = new Set();
  for (const id of scenesUsed) {
    for (const need of SCENES[id].needs ?? []) {
      expect({ scene: id, need, introduced: given.has(need) }).toEqual({ scene: id, need, introduced: true });
    }
    (SCENES[id].gives ?? []).forEach((tag) => given.add(tag));
  }
};

describe('composeStory', () => {
  it.each(ALL_DOLCH)('uses "%s" when it is the only word', (word) => {
    const story = composeStory([word], 'Mia');
    expect(findUsedWords(story.sentences, [word])).toEqual([word]);
  });

  it.each(DOLCH_LISTS.map((list) => [list.label, list.words]))(
    'counts used words from the text for the %s list',
    (_, words) => {
      const lowerCased = words.map((w) => w.toLowerCase());
      const story = composeStory(words, 'Mia');
      expect(story.usedWords).toEqual(findUsedWords(story.sentences, lowerCased));
      expect(story.coveragePercent).toBe(Math.round((story.usedWords.length / words.length) * 100));
    }
  );

  it.each([['both'], ['their'], ['why'], ['they', 'buy'], ['come', 'see', 'everyone'], ['goodbye', 'friends', 'late']])(
    'introduces whoever a scene mentions first, for %p',
    (...words) => {
      assertIntroductionsComeFirst(composeStory(words, 'Mia').scenesUsed);
    }
  );

  it.each(DOLCH_LISTS.map((list) => [list.label, list.words]))('introduces people first for the %s list', (_, words) => {
    assertIntroductionsComeFirst(composeStory(words, 'Mia').scenesUsed);
  });

  it('introduces a friend before "Both friends played together"', () => {
    const { sentences } = composeStory(['both'], 'Mia');
    const both = sentences.findIndex((s) => s.startsWith('Both friends'));
    const friend = sentences.findIndex((s) => /friend/i.test(s));

    expect(both).toBeGreaterThan(-1);
    expect(friend).toBeLessThan(both);
  });

  it('asks the "why" question once, and not with Mom at school', () => {
    const story = composeStory(['why'], 'Mia');
    const questions = story.sentences.filter((s) => s.includes('Why does'));

    expect(questions).toHaveLength(1);
    expect(story.scenesUsed.includes('learn_new') && story.scenesUsed.includes('ask_why')).toBe(false);
  });

  it('keeps the day in order', () => {
    const { scenesUsed } = composeStory(ALL_DOLCH, 'Mia');
    const phases = scenesUsed.map((id) => SCENES[id].phase);
    expect(phases).toEqual([...phases].sort((a, b) => a - b));
  });

  it('always wakes up and goes to bed', () => {
    const { scenesUsed } = composeStory(['zebra'], 'Mia');
    expect(SCENES[scenesUsed[0]].phase).toBe(1);
    expect(SCENES[scenesUsed.at(-1)].phase).toBe(10);
  });

  it(`adds at most ${MAX_EXTRA_SENTENCES} extra sentences`, () => {
    const story = composeStory(ALL_DOLCH, 'Mia');
    expect(story.sentenceScenes.filter((scene) => scene === null).length).toBeLessThanOrEqual(MAX_EXTRA_SENTENCES);
  });

  it('puts extra sentences before the trip home', () => {
    const story = composeStory(['jump', 'run'], 'Mia');
    const firstExtra = story.sentenceScenes.indexOf(null);
    const home = story.sentenceScenes.findIndex((id) => id && SCENES[id].phase >= 8);
    expect(firstExtra).toBeGreaterThan(-1);
    expect(firstExtra).toBeLessThan(home);
  });

  it('puts the name in place of the placeholder', () => {
    const { sentences } = composeStory(ALL_DOLCH, 'Mia');
    expect(sentences.join(' ')).not.toContain('{name}');
    expect(sentences.join(' ')).toContain('Mia');
  });
});

describe('extra sentences', () => {
  it.each(Object.entries(EXTRA_SENTENCES))('the sentence for "%s" contains it', (word, sentence) => {
    expect(findUsedWords([sentence.replace('{name}', 'Mia')], [word])).toEqual([word]);
  });
});

describe('generateStory', () => {
  it('lists as used only words that are in the text, in the given spelling', () => {
    const words = DOLCH_LISTS.find((list) => list.id === 'grade-2').words;
    const story = generateStory(words, 2, {});
    expect(story.usedWords).toEqual(findUsedWords(story.content, words));
  });

  it('ignores repeated words when working out coverage', () => {
    const story = generateStory(['The', 'the', ' the '], 1, {});
    expect(story.words).toEqual(['The']);
    expect(story.coveragePercent).toBe(100);
  });

  it('returns a placeholder story for no words', () => {
    expect(generateStory([' ', ''], 1, {}).usedWords).toEqual([]);
  });
});
