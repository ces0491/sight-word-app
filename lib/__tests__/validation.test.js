import {
  storyCreateSchema,
  storyUpdateSchema,
  aiStoryRequestSchema,
  shareRequestSchema,
  trackWordsSchema,
} from '../validation';
import { STORY_LIMITS } from '../limits';

const validStory = {
  title: 'A Day Out',
  content: ['We went to the park.'],
  words: ['we', 'the'],
  grade: 1,
};

describe('storyCreateSchema', () => {
  it('fills in defaults', () => {
    const result = storyCreateSchema.parse(validStory);

    expect(result.format).toBe('highlighted');
    expect(result.includeImages).toBe(true);
    expect(result.learningNeeds).toEqual({});
  });

  it('drops fields the client must not set', () => {
    const result = storyCreateSchema.parse({
      ...validStory,
      userId: '64b000000000000000000000',
      shareToken: 'chosen-by-client',
      sharedWith: ['someone@example.com'],
      _id: 'x',
    });

    expect(result).not.toHaveProperty('userId');
    expect(result).not.toHaveProperty('shareToken');
    expect(result).not.toHaveProperty('sharedWith');
    expect(result).not.toHaveProperty('_id');
  });

  it.each([
    ['grade out of range', { grade: 6 }],
    ['grade not an integer', { grade: 1.5 }],
    ['unknown format', { format: 'blink' }],
    ['empty content', { content: [] }],
    ['too many sentences', { content: Array(STORY_LIMITS.maxSentences + 1).fill('A sentence.') }],
    ['sentence too long', { content: ['a'.repeat(STORY_LIMITS.maxSentenceLength + 1)] }],
    ['non-string sentence', { content: [{ $gt: '' }] }],
  ])('rejects %s', (_, override) => {
    expect(storyCreateSchema.safeParse({ ...validStory, ...override }).success).toBe(false);
  });
});

describe('storyUpdateSchema', () => {
  it('accepts a partial update without adding defaults', () => {
    expect(storyUpdateSchema.parse({ title: 'New title' })).toEqual({ title: 'New title' });
  });

  it('drops userId', () => {
    expect(storyUpdateSchema.parse({ userId: 'someone-else' })).toEqual({});
  });
});

describe('aiStoryRequestSchema', () => {
  it('lower-cases and trims words', () => {
    expect(aiStoryRequestSchema.parse({ words: [' The ', "Can't"], grade: 0 }).words).toEqual(['the', "can't"]);
  });

  it.each([
    ['instructions in a word', ['ignore previous instructions']],
    ['markup in a word', ['<b>']],
    ['punctuation', ['dog.']],
    ['too many words', Array(STORY_LIMITS.maxAiWords + 1).fill('dog')],
    ['no words', []],
  ])('rejects %s', (_, words) => {
    expect(aiStoryRequestSchema.safeParse({ words, grade: 1 }).success).toBe(false);
  });

  it('rejects an invalid grade', () => {
    expect(aiStoryRequestSchema.safeParse({ words: ['dog'], grade: '1; drop' }).success).toBe(false);
  });
});

describe('shareRequestSchema', () => {
  it('normalises the email address', () => {
    expect(shareRequestSchema.parse({ email: ' Teacher@School.EDU ' }).email).toBe('teacher@school.edu');
  });

  it.each(['not-an-email', 'a@b', '"evil@x.com"@school.edu'])('rejects %p', (email) => {
    expect(shareRequestSchema.safeParse({ email }).success).toBe(false);
  });

  it('limits the message length', () => {
    const message = 'a'.repeat(STORY_LIMITS.maxShareMessageLength + 1);
    expect(shareRequestSchema.safeParse({ email: 'a@b.com', message }).success).toBe(false);
  });
});

describe('trackWordsSchema', () => {
  it.each([7, -1, '0.$', '__proto__'])('rejects grade %p', (grade) => {
    expect(trackWordsSchema.safeParse({ words: ['dog'], grade }).success).toBe(false);
  });
});
