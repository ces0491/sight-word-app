/** @jest-environment node */
import { createRequest, createResponse } from '../apiTestUtils';

jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('../../lib/authOptions', () => ({ authOptions: {} }));
jest.mock('../../lib/dbConnect', () => jest.fn());
jest.mock('../../models/Story', () => ({ findOne: jest.fn(), findOneAndDelete: jest.fn() }));

const { getServerSession } = require('next-auth/next');
const Story = require('../../models/Story');
const handler = require('../../pages/api/stories/[id]').default;

const STORY_ID = '64b0c0ffee0000000000abcd';

/** A stand-in for a Mongoose document. */
const makeStoryDoc = () => {
  const doc = {
    _id: STORY_ID,
    title: 'A Day Out',
    content: ['One morning, Mia woke up very early.', 'The sun was bright.'],
    words: ['the', 'sun'],
    scenes: ['morning_wake', 'morning_wake'],
    usedWords: ['the', 'sun'],
    set(values) {
      Object.assign(doc, values);
    },
    save: jest.fn().mockResolvedValue(undefined),
  };
  return doc;
};

const put = async (body) => {
  const res = createResponse();
  await handler(createRequest({ method: 'PUT', query: { id: STORY_ID }, body }), res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
  getServerSession.mockResolvedValue({ user: { id: 'owner-1' } });
});

describe('PUT /api/stories/[id]', () => {
  it('clears scene ids when the sentences change without new ones', async () => {
    const doc = makeStoryDoc();
    Story.findOne.mockResolvedValue(doc);

    const res = await put({ content: ['Mia went to the park.'] });

    expect(res.statusCode).toBe(200);
    expect(doc.scenes).toEqual([]);
    expect(doc.save).toHaveBeenCalled();
  });

  it('keeps scene ids sent with the new sentences', async () => {
    const doc = makeStoryDoc();
    Story.findOne.mockResolvedValue(doc);

    await put({ content: ['At the park, Mia found many things to do.'], scenes: ['arrive_park'] });

    expect(doc.scenes).toEqual(['arrive_park']);
  });

  it('keeps scene ids when only the title changes', async () => {
    const doc = makeStoryDoc();
    Story.findOne.mockResolvedValue(doc);

    await put({ title: 'A New Title' });

    expect(doc.scenes).toEqual(['morning_wake', 'morning_wake']);
  });

  it('recomputes usedWords from the new sentences', async () => {
    const doc = makeStoryDoc();
    Story.findOne.mockResolvedValue(doc);

    await put({ content: ['The dog ran.'] });

    expect(doc.usedWords).toEqual(['the']);
  });

  it('refuses a learningNeeds update that leaves flags out, so it cannot reset them', async () => {
    Story.findOne.mockResolvedValue(makeStoryDoc());
    const res = await put({ learningNeeds: { adhd: true } });

    expect(res.statusCode).toBe(400);
    expect(Story.findOne).not.toHaveBeenCalled();
  });

  it('accepts a learningNeeds update with all five flags', async () => {
    const doc = makeStoryDoc();
    Story.findOne.mockResolvedValue(doc);
    const learningNeeds = { adhd: true, dyslexia: false, autism: false, esl: false, visualProcessing: true };

    const res = await put({ learningNeeds });

    expect(res.statusCode).toBe(200);
    expect(doc.learningNeeds).toEqual(learningNeeds);
  });
});

describe.each(['GET', 'PUT', 'DELETE'])('%s /api/stories/[id]', (method) => {
  it("only touches the signed-in user's own story", async () => {
    Story.findOne.mockResolvedValue(null);
    Story.findOneAndDelete.mockResolvedValue(null);
    const res = createResponse();
    await handler(createRequest({ method, query: { id: STORY_ID }, body: { title: 'T' } }), res);

    const lookup = method === 'DELETE' ? Story.findOneAndDelete : Story.findOne;
    expect(lookup).toHaveBeenCalledWith({ _id: STORY_ID, userId: 'owner-1' });
    expect(res.statusCode).toBe(404);
  });
});
