/**
 * The Dolch sight word lists: 220 "service words" in five levels.
 *
 * Checked against two sources on 2026-11-05:
 * - https://sightwords.com/sight-words/dolch/ (all five levels, 220 words)
 * - https://en.wikipedia.org/wiki/Dolch_word_list (same lists, except that
 *   it also puts "left" in Second Grade, making 221 against its own stated
 *   total of 220; "left" is left out here)
 */
export const DOLCH_LISTS = [
  {
    id: 'pre-primer',
    label: 'Pre-primer',
    words: [
      'a', 'and', 'away', 'big', 'blue', 'can', 'come', 'down', 'find', 'for',
      'funny', 'go', 'help', 'here', 'I', 'in', 'is', 'it', 'jump', 'little',
      'look', 'make', 'me', 'my', 'not', 'one', 'play', 'red', 'run', 'said',
      'see', 'the', 'three', 'to', 'two', 'up', 'we', 'where', 'yellow', 'you',
    ],
  },
  {
    id: 'primer',
    label: 'Primer',
    words: [
      'all', 'am', 'are', 'at', 'ate', 'be', 'black', 'brown', 'but', 'came',
      'did', 'do', 'eat', 'four', 'get', 'good', 'have', 'he', 'into', 'like',
      'must', 'new', 'no', 'now', 'on', 'our', 'out', 'please', 'pretty', 'ran',
      'ride', 'saw', 'say', 'she', 'so', 'soon', 'that', 'there', 'they', 'this',
      'too', 'under', 'want', 'was', 'well', 'went', 'what', 'white', 'who', 'will',
      'with', 'yes',
    ],
  },
  {
    id: 'grade-1',
    label: 'First grade',
    words: [
      'after', 'again', 'an', 'any', 'as', 'ask', 'by', 'could', 'every', 'fly',
      'from', 'give', 'going', 'had', 'has', 'her', 'him', 'his', 'how', 'just',
      'know', 'let', 'live', 'may', 'of', 'old', 'once', 'open', 'over', 'put',
      'round', 'some', 'stop', 'take', 'thank', 'them', 'then', 'think', 'walk', 'were',
      'when',
    ],
  },
  {
    id: 'grade-2',
    label: 'Second grade',
    words: [
      'always', 'around', 'because', 'been', 'before', 'best', 'both', 'buy', 'call', 'cold',
      'does', "don't", 'fast', 'first', 'five', 'found', 'gave', 'goes', 'green', 'its',
      'made', 'many', 'off', 'or', 'pull', 'read', 'right', 'sing', 'sit', 'sleep',
      'tell', 'their', 'these', 'those', 'upon', 'us', 'use', 'very', 'wash', 'which',
      'why', 'wish', 'work', 'would', 'write', 'your',
    ],
  },
  {
    id: 'grade-3',
    label: 'Third grade',
    words: [
      'about', 'better', 'bring', 'carry', 'clean', 'cut', 'done', 'draw', 'drink', 'eight',
      'fall', 'far', 'full', 'got', 'grow', 'hold', 'hot', 'hurt', 'if', 'keep',
      'kind', 'laugh', 'light', 'long', 'much', 'myself', 'never', 'only', 'own', 'pick',
      'seven', 'shall', 'show', 'six', 'small', 'start', 'ten', 'today', 'together', 'try',
      'warm',
    ],
  },
];

/** A handful of first words for trying the app before choosing a list. */
export const STARTER_WORDS = ['the', 'see', 'can', 'go', 'my', 'play'];
