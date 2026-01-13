// lib/storyComposer.js

/**
 * Story Composer - Builds coherent stories by selecting scenes in temporal order
 * while maximizing sight word coverage.
 */

import { sceneLibrary, PHASES } from './storyScenes.js';

/**
 * Compose a story from scenes based on target sight words
 * Stories follow a natural day progression: wake up → activities → bedtime
 *
 * @param {string[]} targetWords - Sight words to include
 * @param {string} childName - Name to use in the story
 * @returns {object} - Composed story with sentences and metadata
 */
export const composeStory = (targetWords, childName = 'Alex') => {
  const normalizedTargets = targetWords.map(w => w.toLowerCase().trim());
  const usedWords = new Set();
  const selectedScenes = [];
  const usedSceneIds = new Set();

  // Group scenes by phase
  const scenesByPhase = {};
  for (const scene of sceneLibrary) {
    if (!scenesByPhase[scene.phase]) {
      scenesByPhase[scene.phase] = [];
    }
    scenesByPhase[scene.phase].push(scene);
  }

  // Build story in temporal order
  const phaseOrder = [
    PHASES.WAKE_UP,
    PHASES.MORNING_ROUTINE,
    PHASES.LEAVE_HOME,
    PHASES.TRAVEL,
    PHASES.ACTIVITY_1,
    PHASES.ACTIVITY_2,
    PHASES.ACTIVITY_3,
    PHASES.RETURN_HOME,
    PHASES.EVENING,
    PHASES.BEDTIME
  ];

  // Select best scene from each phase (if it adds value)
  for (const phase of phaseOrder) {
    const candidates = scenesByPhase[phase] || [];
    if (candidates.length === 0) continue;

    // Find best scene for this phase based on new word coverage
    const bestScene = selectBestSceneForPhase(
      candidates,
      normalizedTargets,
      usedWords,
      usedSceneIds,
      phase
    );

    if (bestScene) {
      selectedScenes.push(bestScene);
      usedSceneIds.add(bestScene.id);
      bestScene.words.forEach(w => {
        if (normalizedTargets.includes(w.toLowerCase())) {
          usedWords.add(w.toLowerCase());
        }
      });
    }
  }

  // If we still need more words and have few scenes, try to add more activity scenes
  if (usedWords.size < normalizedTargets.length * 0.7 && selectedScenes.length < 8) {
    const activityPhases = [PHASES.ACTIVITY_1, PHASES.ACTIVITY_2, PHASES.ACTIVITY_3];
    for (const phase of activityPhases) {
      const candidates = (scenesByPhase[phase] || []).filter(s => !usedSceneIds.has(s.id));
      const bestScene = selectBestSceneForPhase(candidates, normalizedTargets, usedWords, usedSceneIds, phase);
      if (bestScene && getNewWordCount(bestScene, normalizedTargets, usedWords) > 0) {
        // Insert in correct position based on phase
        const insertIndex = findInsertIndex(selectedScenes, phase);
        selectedScenes.splice(insertIndex, 0, bestScene);
        usedSceneIds.add(bestScene.id);
        bestScene.words.forEach(w => {
          if (normalizedTargets.includes(w.toLowerCase())) {
            usedWords.add(w.toLowerCase());
          }
        });
      }
    }
  }

  // Generate story content
  const sentences = [];
  selectedScenes.forEach(scene => {
    scene.sentences.forEach(sentence => {
      sentences.push(sentence.replace(/{name}/g, childName));
    });
  });

  // Add supplementary sentences for remaining uncovered words
  const stillUncovered = normalizedTargets.filter(w => !usedWords.has(w));
  if (stillUncovered.length > 0) {
    const extraSentences = generateExtraSentences(stillUncovered, childName, usedWords);
    if (extraSentences.length > 0) {
      // Find a good spot to insert (before return home or at the end of activities)
      const insertIndex = findActivityEndIndex(selectedScenes, sentences);
      sentences.splice(insertIndex, 0, ...extraSentences);
    }
  }

  // Generate title
  const title = generateTitle(selectedScenes);

  return {
    title,
    sentences,
    usedWords: Array.from(usedWords),
    totalTargetWords: normalizedTargets.length,
    coveragePercent: Math.round((usedWords.size / normalizedTargets.length) * 100),
    scenesUsed: selectedScenes.map(s => s.id)
  };
};

/**
 * Select the best scene from candidates for a given phase
 */
const selectBestSceneForPhase = (candidates, targetWords, usedWords, usedSceneIds, phase) => {
  let bestScene = null;
  let bestScore = -1;

  // For required phases (wake up, bedtime), always select even if no new words
  const requiredPhases = [PHASES.WAKE_UP, PHASES.BEDTIME];
  const isRequired = requiredPhases.includes(phase);

  for (const scene of candidates) {
    if (usedSceneIds.has(scene.id)) continue;

    const newWords = getNewWordCount(scene, targetWords, usedWords);
    const totalRelevant = scene.words.filter(w => targetWords.includes(w.toLowerCase())).length;

    // Score based on new words (heavily weighted) plus total relevance
    const score = newWords * 10 + totalRelevant;

    if (score > bestScore) {
      bestScore = score;
      bestScene = scene;
    }
  }

  // For required phases, return best scene even with score 0
  // For optional phases, only return if adds value (score > 0)
  if (isRequired) {
    return bestScene;
  }
  return bestScore > 0 ? bestScene : null;
};

/**
 * Count new words a scene would add
 */
const getNewWordCount = (scene, targetWords, usedWords) => {
  let count = 0;
  for (const word of scene.words) {
    const lower = word.toLowerCase();
    if (targetWords.includes(lower) && !usedWords.has(lower)) {
      count++;
    }
  }
  return count;
};

/**
 * Find correct insertion index to maintain temporal order
 */
const findInsertIndex = (selectedScenes, targetPhase) => {
  for (let i = 0; i < selectedScenes.length; i++) {
    if (selectedScenes[i].phase > targetPhase) {
      return i;
    }
  }
  return selectedScenes.length;
};

/**
 * Find the end of activity section in sentences
 */
const findActivityEndIndex = (selectedScenes, sentences) => {
  // Find where RETURN_HOME starts, insert before that
  let sentenceIndex = 0;
  for (const scene of selectedScenes) {
    if (scene.phase >= PHASES.RETURN_HOME) {
      return sentenceIndex;
    }
    sentenceIndex += scene.sentences.length;
  }
  // If no return home, insert before last 2 sentences (usually closing)
  return Math.max(0, sentences.length - 2);
};

/**
 * Generate supplementary sentences for uncovered words
 */
const generateExtraSentences = (uncoveredWords, name, usedWords) => {
  const sentences = [];
  const wordSentences = {
    'ride': `${name} also got to ride around on a bike.`,
    'eight': `${name} counted eight special things that day.`,
    'work': `All the work was worth it in the end.`,
    'always': `${name} would always remember this day.`,
    'round': `They found a pretty round stone on the ground.`,
    'tell': `"Let me tell you about my day," said ${name}.`,
    'around': `${name} looked around and smiled.`,
    'gave': `${name} gave a big thank you hug.`,
    'their': `All the friends shared their favorite things.`,
    'because': `${name} was happy because it was such a good day.`,
    'does': `"What does this do?" asked ${name}.`,
    'these': `"I love these!" said ${name}.`,
    'been': `It had been an amazing adventure.`,
    'those': `${name} wanted to try those games next time.`,
    'before': `This was better than ever before.`,
    'is': `"This is wonderful!" said ${name}.`,
    'on': `${name} put everything back on the shelf.`,
    'best': `It was the best time ever.`,
    'made': `${name} made so many happy memories.`,
    'both': `Both friends agreed it was perfect.`,
    'many': `There were so many things to be thankful for.`,
    'use': `${name} learned to use new skills.`,
    'buy': `Maybe they could buy a treat tomorrow.`,
    'off': `${name} took off running one more time.`,
    'very': `${name} was very grateful.`,
    'call': `"I will call you tomorrow!" said ${name}.`,
    'for': `This day was one for the books!`,
    'wash': `It was time to wash up and rest.`,
    'cold': `A cold drink tasted so good.`,
    'full': `${name}'s heart was full of joy.`,
    'which': `${name} knew which memories to treasure.`,
    'read': `${name} wanted to read about more adventures.`,
    'why': `Now ${name} understood why this day was special.`,
    'do': `"What should we do next?" wondered ${name}.`,
    'right': `Everything felt just right.`,
    'with': `Being with friends made it special.`,
    'fast': `Time went by so fast!`,
    'sing': `${name} felt like singing a happy song.`,
    'first': `This was the first of many good days.`,
    'sit': `${name} sat down to think about the day.`,
    'would': `${name} would never forget this.`,
    'five': `${name} could think of five amazing moments.`,
    'sleep': `Soon it would be time to sleep.`,
    'write': `${name} wanted to write about this adventure.`,
    'come': `"Come back soon!" called the friends.`
  };

  // Add sentences for up to 10 uncovered words
  let added = 0;
  for (const word of uncoveredWords) {
    if (added >= 10) break;
    const lower = word.toLowerCase();
    if (wordSentences[lower] && !usedWords.has(lower)) {
      sentences.push(wordSentences[lower]);
      usedWords.add(lower);
      added++;
    }
  }

  return sentences;
};

/**
 * Generate appropriate title based on scenes used
 */
const generateTitle = (scenes) => {
  const sceneIds = scenes.map(s => s.id);

  if (sceneIds.some(id => id.includes('ride') || id.includes('bike'))) {
    return "A Bike Ride Adventure";
  }
  if (sceneIds.some(id => id.includes('park'))) {
    return "A Day at the Park";
  }
  if (sceneIds.some(id => id.includes('school') || id.includes('learn'))) {
    return "A School Day Adventure";
  }
  if (sceneIds.some(id => id.includes('friend') || id.includes('play_together'))) {
    return "A Day with Friends";
  }

  const titles = [
    "A Wonderful Day",
    "The Best Day Ever",
    "A Special Adventure",
    "One Amazing Day"
  ];
  return titles[Math.floor(Math.random() * titles.length)];
};

export default composeStory;
