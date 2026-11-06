// lib/storyComposer.js

/**
 * Story Composer - builds a day-in-the-life story by choosing scenes in
 * temporal order, favouring scenes that use the child's sight words. Words
 * no chosen scene covers get a short extra sentence each (lib/extraSentences.js).
 */

import { sceneLibrary, PHASES } from './storyScenes.js';
import { EXTRA_SENTENCES, MAX_EXTRA_SENTENCES } from './extraSentences.js';
import { findWords, findUsedWords, wordKey } from './sightWords.js';

const NAME_PLACEHOLDER = /{name}/g;

/** Scenes with their words read from their sentences (the name placeholder isn't a word). */
const SCENES = sceneLibrary.map((scene) => ({
  ...scene,
  words: new Set(scene.sentences.flatMap((sentence) => findWords(sentence.replace(NAME_PLACEHOLDER, ' ')).map((w) => w.key))),
  gives: scene.gives ?? [],
  needs: scene.needs ?? [],
}));

const PHASE_ORDER = [
  PHASES.WAKE_UP,
  PHASES.MORNING_ROUTINE,
  PHASES.LEAVE_HOME,
  PHASES.TRAVEL,
  PHASES.ACTIVITY_1,
  PHASES.ACTIVITY_2,
  PHASES.ACTIVITY_3,
  PHASES.RETURN_HOME,
  PHASES.EVENING,
  PHASES.BEDTIME,
];

/** Every story wakes up and goes to bed, even if those scenes add no words. */
const REQUIRED_PHASES = new Set([PHASES.WAKE_UP, PHASES.BEDTIME]);

/**
 * Compose a story from scenes based on target sight words.
 * Stories follow a natural day: wake up → activities → bedtime.
 *
 * @param {string[]} targetWords - Sight words to include
 * @param {string} childName - Name to use in the story
 * @returns {object} - Sentences, the scene behind each, and the words used
 */
export const composeStory = (targetWords, childName = 'Alex') => {
  const targets = [...new Set(targetWords.map((word) => wordKey(word.trim())).filter(Boolean))];
  const selected = [];
  const usedIds = new Set();
  const usedGroups = new Set();

  const isAvailable = (scene) => !usedIds.has(scene.id) && !(scene.group && usedGroups.has(scene.group));
  const covered = () => new Set(selected.flatMap((scene) => targets.filter((t) => scene.words.has(t))));
  const newWordCount = (scene, done) => targets.filter((t) => scene.words.has(t) && !done.has(t)).length;

  /** The highest-scoring scene: new words count most, repeats of covered words a little. Ties go to library order. */
  const bestOf = (candidates) => {
    const done = covered();
    let best = null;
    let bestScore = -1;
    for (const scene of candidates) {
      const score = newWordCount(scene, done) * 10 + targets.filter((t) => scene.words.has(t)).length;
      if (score > bestScore) {
        best = scene;
        bestScore = score;
      }
    }
    return { scene: best, score: bestScore, newWords: best ? newWordCount(best, done) : 0 };
  };

  const choose = (scene, index = selected.length) => {
    selected.splice(index, 0, scene);
    usedIds.add(scene.id);
    if (scene.group) usedGroups.add(scene.group);
  };

  /** Before the first chosen scene of the same phase or later, keeping the day in order. */
  const insertIndexFor = (phase) => {
    const index = selected.findIndex((scene) => scene.phase >= phase);
    return index === -1 ? selected.length : index;
  };

  // One scene per phase, if it uses a target word (or the phase is required)
  for (const phase of PHASE_ORDER) {
    const { scene, score } = bestOf(SCENES.filter((s) => s.phase === phase && isAvailable(s)));
    if (scene && (REQUIRED_PHASES.has(phase) || score > 0)) choose(scene);
  }

  // Still short of words: add more activity scenes that cover new ones
  if (covered().size < targets.length * 0.7 && selected.length < 8) {
    for (const phase of [PHASES.ACTIVITY_1, PHASES.ACTIVITY_2, PHASES.ACTIVITY_3]) {
      const { scene, newWords } = bestOf(SCENES.filter((s) => s.phase === phase && isAvailable(s)));
      if (scene && newWords > 0) choose(scene, insertIndexFor(phase + 1));
    }
  }

  // Introduce whoever a scene mentions before that scene: a friend before
  // "both friends played", Mom before Mom answers a question
  for (let i = 0; i < selected.length; i++) {
    const scene = selected[i];
    const given = new Set(selected.slice(0, i).flatMap((s) => s.gives));
    const missing = scene.needs.find((need) => !given.has(need));
    if (!missing) continue;

    const { scene: giver } = bestOf(SCENES.filter((s) => isAvailable(s) && s.gives.includes(missing) && s.phase <= scene.phase));
    if (giver) {
      choose(giver, Math.min(insertIndexFor(giver.phase), i));
    } else {
      selected.splice(i, 1);
    }
    i = -1; // Check again from the start: positions and what has been introduced changed
  }

  const sentences = [];
  const sentenceScenes = [];
  for (const scene of selected) {
    for (const sentence of scene.sentences) {
      sentences.push(sentence.replace(NAME_PLACEHOLDER, childName));
      sentenceScenes.push(scene.id);
    }
  }

  // One extra sentence for each word the scenes didn't cover, before the trip home
  const done = covered();
  const extras = targets
    .filter((t) => !done.has(t) && EXTRA_SENTENCES[t])
    .slice(0, MAX_EXTRA_SENTENCES)
    .map((t) => EXTRA_SENTENCES[t].replace(NAME_PLACEHOLDER, childName));
  if (extras.length > 0) {
    const homeScene = selected.findIndex((scene) => scene.phase >= PHASES.RETURN_HOME);
    const insertAt = homeScene === -1 ? sentences.length : sentenceScenes.indexOf(selected[homeScene].id);
    sentences.splice(insertAt, 0, ...extras);
    // Extra sentences don't belong to a scene
    sentenceScenes.splice(insertAt, 0, ...extras.map(() => null));
  }

  // Counted from the finished text, so the list matches what the child reads
  const usedWords = findUsedWords(sentences, targets);

  return {
    title: generateTitle(selected),
    sentences,
    sentenceScenes,
    usedWords,
    totalTargetWords: targets.length,
    coveragePercent: targets.length ? Math.round((usedWords.length / targets.length) * 100) : 0,
    scenesUsed: selected.map((s) => s.id),
  };
};

/**
 * Generate appropriate title based on scenes used
 */
const generateTitle = (scenes) => {
  const sceneIds = scenes.map((s) => s.id);

  if (sceneIds.some((id) => id.includes('ride') || id.includes('bike'))) {
    return 'A Bike Ride Adventure';
  }
  if (sceneIds.some((id) => id.includes('park'))) {
    return 'A Day at the Park';
  }
  if (sceneIds.some((id) => id.includes('school') || id.includes('learn'))) {
    return 'A School Day Adventure';
  }
  if (sceneIds.some((id) => id.includes('friend') || id.includes('play_together'))) {
    return 'A Day with Friends';
  }

  const titles = ['A Wonderful Day', 'The Best Day Ever', 'A Special Adventure', 'One Amazing Day'];
  return titles[Math.floor(Math.random() * titles.length)];
};
