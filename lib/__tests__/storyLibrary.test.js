import {
  LIBRARY_KEY,
  addStory,
  deleteStory,
  findSavedStory,
  getSavedStories,
  subscribeToSavedStories,
  updateStory,
} from '../storyLibrary';

const fields = {
  title: 'The Dog Can Run',
  content: ['The dog can run.', 'I see the dog.'],
  scenes: ['park-run', null],
  words: ['the', 'can', 'see', 'jump'],
  grade: 1,
};

const stored = () => JSON.parse(window.localStorage.getItem(LIBRARY_KEY));

beforeEach(() => {
  window.localStorage.clear();
  jest.restoreAllMocks();
});

describe('addStory', () => {
  it('saves the story with an id, a date and defaults, newest first', () => {
    const { story: first } = addStory(fields);
    const { story: second } = addStory({ ...fields, title: 'Second' });

    expect(first).toMatchObject({
      ...fields,
      format: 'highlighted',
      includeImages: true,
      learningNeeds: {},
      usedWords: ['the', 'can', 'see'],
    });
    expect(first.id).toEqual(expect.any(String));
    expect(new Date(first.createdAt).toString()).not.toBe('Invalid Date');
    expect(second.id).not.toBe(first.id);
    expect(getSavedStories().map((s) => s.title)).toEqual(['Second', 'The Dog Can Run']);
  });

  it('keeps only the fields the library needs', () => {
    addStory({ ...fields, usedWords: ['jump'], timestamp: 'x', userId: 'someone' });

    expect(Object.keys(stored()[0]).sort()).toEqual(
      ['content', 'createdAt', 'format', 'grade', 'id', 'includeImages', 'learningNeeds', 'scenes', 'title', 'words'].sort()
    );
  });

  it("doesn't save a story that breaks the limits", () => {
    expect(addStory({ ...fields, title: '' })).toEqual({ problem: expect.any(String) });
    expect(window.localStorage.getItem(LIBRARY_KEY)).toBeNull();
  });

  it('says when the browser is out of room', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });

    expect(addStory(fields).problem).toMatch(/no room for more stories/);
  });

  it("says when the browser won't keep stories", () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });

    expect(addStory(fields).problem).toMatch(/isn't keeping stories/);
  });
});

describe('updateStory', () => {
  it('changes the fields given and keeps the id and date', () => {
    const { story } = addStory(fields);
    const { story: updated } = updateStory(story.id, { title: 'New title', grade: 3, scenes: fields.scenes });

    expect(updated).toMatchObject({ id: story.id, createdAt: story.createdAt, title: 'New title', grade: 3, scenes: fields.scenes });
    expect(findSavedStory(story.id).title).toBe('New title');
  });

  it('clears the scenes when the sentences change without new ones', () => {
    const { story } = addStory(fields);
    expect(updateStory(story.id, { content: ['A jump.'] }).story).toMatchObject({ scenes: [], usedWords: ['jump'] });
  });

  it("refuses changes that break the limits, and stories that aren't there", () => {
    const { story } = addStory(fields);
    expect(updateStory(story.id, { title: '' }).problem).toEqual(expect.any(String));
    expect(updateStory('missing', { title: 'x' }).problem).toBe('This story was not found.');
    expect(findSavedStory(story.id).title).toBe(fields.title);
  });
});

describe('deleteStory', () => {
  it('removes the story', () => {
    const { story } = addStory(fields);
    expect(deleteStory(story.id)).toBeNull();
    expect(getSavedStories()).toEqual([]);
  });

  it("says when the story isn't there", () => {
    expect(deleteStory('missing')).toBe('This story was not found.');
  });
});

describe('reading the library', () => {
  it("keeps entries it can't read in storage, but doesn't list them", () => {
    const odd = { id: 'odd', title: 42 };
    window.localStorage.setItem(LIBRARY_KEY, JSON.stringify([odd]));

    expect(getSavedStories()).toEqual([]);
    addStory(fields);
    expect(getSavedStories()).toHaveLength(1);
    expect(stored()).toContainEqual(odd);
  });

  it('treats unreadable storage as an empty library', () => {
    window.localStorage.setItem(LIBRARY_KEY, '{not json');
    expect(getSavedStories()).toEqual([]);
  });

  it('returns the same list until the library changes', () => {
    addStory(fields);
    const first = getSavedStories();
    expect(getSavedStories()).toBe(first);
    addStory(fields);
    expect(getSavedStories()).not.toBe(first);
  });
});

describe('subscribeToSavedStories', () => {
  it('tells subscribers about changes here and in other tabs, until they unsubscribe', () => {
    const listener = jest.fn();
    const unsubscribe = subscribeToSavedStories(listener);

    addStory(fields);
    window.dispatchEvent(new StorageEvent('storage', { key: LIBRARY_KEY }));
    window.dispatchEvent(new StorageEvent('storage', { key: 'something-else' }));
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    addStory(fields);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
