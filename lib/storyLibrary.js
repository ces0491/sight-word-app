/**
 * The story library: saved stories, kept in this browser's localStorage and
 * never sent anywhere. Storage can be blocked or full, so writes report a
 * problem instead of throwing.
 *
 * Entries that don't parse (written by hand, or by a later version with
 * other rules) are left in storage untouched and not shown.
 */

import { newStorySchema, savedStorySchema } from './validation';
import { findUsedWords } from './sightWords';

export const LIBRARY_KEY = 'sightwords:library';

const NOT_FOUND = 'This story was not found.';
const NO_ROOM = 'This browser has no room for more stories. Delete some from the story library, then try again.';
const NOT_KEPT = "This browser isn't keeping stories for this site. Check that it allows this site to store data.";
const NOT_VALID = 'The story could not be saved. Please try again.';

const NO_STORIES = [];

/** A new id, unique within this browser's library. */
const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

/** The stored list as text, or null when there is none or storage is blocked. */
const readText = () => {
  try {
    return window.localStorage.getItem(LIBRARY_KEY);
  } catch {
    return null;
  }
};

/** Every stored entry, valid or not. */
const readEntries = (text = readText()) => {
  try {
    const entries = JSON.parse(text ?? '[]');
    return Array.isArray(entries) ? entries : [];
  } catch {
    return [];
  }
};

/** The stories in stored entries, newest first, with the sight words each one uses. */
const parseStories = (text) =>
  readEntries(text).flatMap((entry) => {
    const parsed = savedStorySchema.safeParse(entry);
    if (!parsed.success) return [];
    const story = parsed.data;
    return [{ ...story, usedWords: findUsedWords(story.content, story.words) }];
  });

const listeners = new Set();

/** Store the entries and tell subscribers. Returns a problem to show, or null. */
const writeEntries = (entries) => {
  try {
    window.localStorage.setItem(LIBRARY_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving the story library:', error);
    return error?.name === 'QuotaExceededError' ? NO_ROOM : NOT_KEPT;
  }
  listeners.forEach((listener) => listener());
  return null;
};

/** Only what the library keeps: computed fields such as usedWords are worked out again on reading. */
const toEntry = (story) => {
  const { id, title, content, scenes, words, format, includeImages, grade, learningNeeds, createdAt } = story;
  return { id, title, content, scenes, words, format, includeImages, grade, learningNeeds, createdAt };
};

let snapshot = { text: undefined, stories: NO_STORIES };

/**
 * The saved stories, newest first. The same array is returned until the
 * library changes, as useSyncExternalStore needs.
 * @returns {object[]}
 */
export function getSavedStories() {
  const text = readText();
  if (text !== snapshot.text) snapshot = { text, stories: parseStories(text) };
  return snapshot.stories;
}

/**
 * Call `listener` when the library changes, in this tab or another one.
 * @returns {() => void} Unsubscribe
 */
export function subscribeToSavedStories(listener) {
  const onStorage = (event) => {
    // key is null when another tab clears all of this site's storage
    if (event.key === LIBRARY_KEY || event.key === null) listener();
  };
  listeners.add(listener);
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

/** The saved story with this id, or null. */
export const findSavedStory = (id) => getSavedStories().find((story) => story.id === id) ?? null;

/**
 * Save a new story.
 * @param {object} fields - title, content, words, grade, and optionally scenes, format, includeImages, learningNeeds
 * @returns {{ story: object } | { problem: string }}
 */
export function addStory(fields) {
  const parsed = newStorySchema.safeParse(fields);
  if (!parsed.success) return { problem: NOT_VALID };

  const entry = toEntry({ ...parsed.data, id: newId(), createdAt: new Date().toISOString() });
  const problem = writeEntries([entry, ...readEntries()]);
  if (problem) return { problem };
  return { story: findSavedStory(entry.id) };
}

/**
 * Change a saved story. New sentences without new scenes clear the scenes,
 * which no longer line up with them.
 * @param {string} id
 * @param {object} changes - Any of the fields addStory takes
 * @returns {{ story: object } | { problem: string }}
 */
export function updateStory(id, changes) {
  const entries = readEntries();
  const index = entries.findIndex((entry) => entry?.id === id);
  if (index === -1) return { problem: NOT_FOUND };

  const merged = { ...entries[index], ...changes, id, createdAt: entries[index].createdAt };
  if (changes.content && !changes.scenes) merged.scenes = [];
  const parsed = savedStorySchema.safeParse(merged);
  if (!parsed.success) return { problem: NOT_VALID };

  const problem = writeEntries(entries.map((entry, i) => (i === index ? toEntry(parsed.data) : entry)));
  if (problem) return { problem };
  return { story: findSavedStory(id) };
}

/**
 * Delete a saved story.
 * @param {string} id
 * @returns {string | null} A problem to show, or null once it's gone
 */
export function deleteStory(id) {
  const entries = readEntries();
  if (!entries.some((entry) => entry?.id === id)) return NOT_FOUND;
  return writeEntries(entries.filter((entry) => entry?.id !== id));
}
