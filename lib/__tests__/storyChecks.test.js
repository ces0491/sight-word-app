import { checkStoryForSave, addWordsWithinLimit, responseProblem } from '../storyChecks';
import { STORY_LIMITS } from '../limits';

const valid = { title: ' A Day Out ', content: ['We went out.', '   ', 'It was fun. '], words: ['we'] };

describe('checkStoryForSave', () => {
  it('trims the title and sentences and drops blank sentences', () => {
    expect(checkStoryForSave(valid)).toEqual({
      story: { title: 'A Day Out', content: ['We went out.', 'It was fun.'], words: ['we'] },
      problem: null,
    });
  });

  it.each([
    ['no title', { title: '  ' }, 'Give the story a title.'],
    ['a long title', { title: 'a'.repeat(STORY_LIMITS.maxTitleLength + 1) }, `Titles can be up to ${STORY_LIMITS.maxTitleLength} characters.`],
    ['only blank sentences', { content: ['', ' '] }, 'Add at least one sentence.'],
    ['too many sentences', { content: Array(STORY_LIMITS.maxSentences + 1).fill('Hi.') }, `Stories can have up to ${STORY_LIMITS.maxSentences} sentences.`],
    [
      'a long sentence',
      { content: ['Fine.', 'a'.repeat(STORY_LIMITS.maxSentenceLength + 1)] },
      `Sentence 2 is too long. Sentences can be up to ${STORY_LIMITS.maxSentenceLength} characters.`,
    ],
    ['no words', { words: [] }, 'Add at least one sight word.'],
    ['too many words', { words: Array.from({ length: STORY_LIMITS.maxWords + 1 }, (_, i) => `w${i}`) }, `Stories can use up to ${STORY_LIMITS.maxWords} sight words.`],
  ])('explains %s', (_, override, problem) => {
    expect(checkStoryForSave({ ...valid, ...override }).problem).toBe(problem);
  });
});

describe('addWordsWithinLimit', () => {
  it('adds new words in lower case, skipping ones already there', () => {
    expect(addWordsWithinLimit(['the'], ['The', 'See', 'see'])).toEqual({ words: ['the', 'see'], skipped: 0 });
  });

  it('stops at the word limit and counts what was left out', () => {
    const full = Array.from({ length: STORY_LIMITS.maxWords - 1 }, (_, i) => `w${i}`);
    expect(addWordsWithinLimit(full, ['a', 'b', 'c'])).toEqual({ words: [...full, 'a'], skipped: 2 });
  });
});

describe('responseProblem', () => {
  const response = (status, body) => ({ status, json: () => Promise.resolve(body) });

  it('says when the session has ended', async () => {
    await expect(responseProblem(response(401, {}), 'x')).resolves.toMatch(/signed out/);
  });

  it("shows the server's message", async () => {
    await expect(responseProblem(response(400, { message: 'Names can be up to 60 characters.' }), 'x')).resolves.toBe(
      'Names can be up to 60 characters.'
    );
  });

  it('uses the fallback for a generic or missing message', async () => {
    await expect(responseProblem(response(400, { message: 'Invalid request' }), 'Try again.')).resolves.toBe('Try again.');
    await expect(responseProblem({ status: 500, json: () => Promise.reject(new Error('not json')) }, 'Try again.')).resolves.toBe('Try again.');
  });
});
