import { useSyncExternalStore } from 'react';
import { getSavedStories, subscribeToSavedStories } from '../lib/storyLibrary';

const NO_STORIES = [];
const neverChanges = () => () => {};

/**
 * The story library's stories, newest first, kept up to date when they
 * change here or in another tab. The server has no library, so pages render
 * with none and fill in once they reach the browser.
 */
export function useSavedStories() {
  return useSyncExternalStore(subscribeToSavedStories, getSavedStories, () => NO_STORIES);
}

/**
 * False on the server and while hydrating, true after. Pages that show the
 * library use it to say "loading" rather than "no stories" before then.
 */
export function useHydrated() {
  return useSyncExternalStore(
    neverChanges,
    () => true,
    () => false
  );
}
