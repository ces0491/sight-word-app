// lib/storyScenes.js

/**
 * Scene-Based Story Composition System
 *
 * Stories follow a logical timeline:
 * 1. WAKE_UP - Character wakes up
 * 2. MORNING_ROUTINE - Wash, dress, breakfast
 * 3. LEAVE_HOME - Go somewhere
 * 4. ACTIVITY - Main activities of the day
 * 5. RETURN_HOME - Come back
 * 6. EVENING - Dinner, wind down
 * 7. BEDTIME - Sleep
 *
 * Each scene has a phase number to enforce temporal order.
 */

// Story phases in chronological order
export const PHASES = {
  WAKE_UP: 1,
  MORNING_ROUTINE: 2,
  LEAVE_HOME: 3,
  TRAVEL: 4,
  ACTIVITY_1: 5,
  ACTIVITY_2: 6,
  ACTIVITY_3: 7,
  RETURN_HOME: 8,
  EVENING: 9,
  BEDTIME: 10
};

// Settings for location continuity
export const SETTINGS = {
  HOME: 'home',
  PARK: 'park',
  SCHOOL: 'school',
  OUTSIDE: 'outside',
  STORE: 'store',
  ANYWHERE: 'anywhere'
};

/**
 * Library of story scenes with temporal ordering
 */
export const sceneLibrary = [
  // ============ PHASE 1: WAKE UP ============
  {
    id: 'morning_wake',
    phase: PHASES.WAKE_UP,
    setting: SETTINGS.HOME,
    sentences: [
      'One morning, {name} woke up very early.',
      'The sun was bright, and it was going to be a good day.'
    ],
    words: ['one', 'morning', 'woke', 'up', 'very', 'early', 'the', 'sun', 'was', 'bright', 'and', 'it', 'going', 'to', 'be', 'a', 'good', 'day']
  },
  {
    id: 'excited_morning',
    phase: PHASES.WAKE_UP,
    setting: SETTINGS.HOME,
    sentences: [
      '{name} jumped out of bed with a big smile.',
      '"Today is going to be the best day!" said {name}.'
    ],
    words: ['jumped', 'out', 'of', 'bed', 'with', 'a', 'big', 'smile', 'today', 'is', 'going', 'to', 'be', 'the', 'best', 'day', 'said']
  },
  {
    id: 'special_day_start',
    phase: PHASES.WAKE_UP,
    setting: SETTINGS.HOME,
    sentences: [
      'This was no ordinary day for {name}.',
      'Something very special was about to happen.'
    ],
    words: ['this', 'was', 'no', 'ordinary', 'day', 'for', 'something', 'very', 'special', 'about', 'to', 'happen']
  },

  // ============ PHASE 2: MORNING ROUTINE ============
  {
    id: 'wash_up',
    phase: PHASES.MORNING_ROUTINE,
    setting: SETTINGS.HOME,
    sentences: [
      'First, {name} went to wash up.',
      'The cold water helped {name} feel awake and ready.'
    ],
    words: ['first', 'went', 'to', 'wash', 'up', 'the', 'cold', 'water', 'helped', 'feel', 'awake', 'and', 'ready']
  },
  {
    id: 'get_dressed',
    phase: PHASES.MORNING_ROUTINE,
    setting: SETTINGS.HOME,
    sentences: [
      '{name} put on the best clothes from the closet.',
      '"Which shirt should I use today?" wondered {name}.'
    ],
    words: ['put', 'on', 'the', 'best', 'clothes', 'from', 'closet', 'which', 'shirt', 'should', 'i', 'use', 'today', 'wondered']
  },
  {
    id: 'eat_breakfast',
    phase: PHASES.MORNING_ROUTINE,
    setting: SETTINGS.HOME,
    sentences: [
      'Mom made a full breakfast for everyone.',
      '{name} ate quickly because there was so much to do.'
    ],
    words: ['mom', 'made', 'a', 'full', 'breakfast', 'for', 'everyone', 'ate', 'quickly', 'because', 'there', 'was', 'so', 'much', 'to', 'do']
  },

  // ============ PHASE 3: LEAVE HOME ============
  {
    id: 'go_outside',
    phase: PHASES.LEAVE_HOME,
    setting: SETTINGS.OUTSIDE,
    sentences: [
      'After getting ready, {name} went outside.',
      'The air was fresh and the sky was very blue.'
    ],
    words: ['after', 'getting', 'ready', 'went', 'outside', 'the', 'air', 'was', 'fresh', 'and', 'sky', 'very', 'blue']
  },
  {
    id: 'leave_with_mom',
    phase: PHASES.LEAVE_HOME,
    setting: SETTINGS.OUTSIDE,
    sentences: [
      '"Let us go now," said Mom.',
      '{name} was very excited to leave the house.'
    ],
    words: ['let', 'us', 'go', 'now', 'said', 'mom', 'was', 'very', 'excited', 'to', 'leave', 'the', 'house']
  },

  // ============ PHASE 4: TRAVEL ============
  {
    id: 'walk_around',
    phase: PHASES.TRAVEL,
    setting: SETTINGS.OUTSIDE,
    sentences: [
      '{name} took a walk around the block.',
      'Many birds were singing in the trees along the way.'
    ],
    words: ['took', 'a', 'walk', 'around', 'the', 'block', 'many', 'birds', 'were', 'singing', 'in', 'trees', 'along', 'way']
  },
  {
    id: 'ride_bike',
    phase: PHASES.TRAVEL,
    setting: SETTINGS.OUTSIDE,
    sentences: [
      '{name} wanted to ride a bike around the neighborhood.',
      'Going fast down the road was always the best part!'
    ],
    words: ['wanted', 'to', 'ride', 'a', 'bike', 'around', 'the', 'neighborhood', 'going', 'fast', 'down', 'road', 'was', 'always', 'best', 'part']
  },

  // ============ PHASE 5-7: ACTIVITIES ============
  {
    id: 'arrive_park',
    phase: PHASES.ACTIVITY_1,
    setting: SETTINGS.PARK,
    sentences: [
      'At the park, {name} found many things to do.',
      'There were swings, slides, and a big round sandbox.'
    ],
    words: ['at', 'the', 'park', 'found', 'many', 'things', 'to', 'do', 'there', 'were', 'swings', 'slides', 'and', 'a', 'big', 'round', 'sandbox']
  },
  {
    id: 'meet_friend',
    phase: PHASES.ACTIVITY_1,
    setting: SETTINGS.ANYWHERE,
    sentences: [
      'A friend came over to say hello.',
      '"Do you want to play with me?" asked the friend.'
    ],
    words: ['a', 'friend', 'came', 'over', 'to', 'say', 'hello', 'do', 'you', 'want', 'play', 'with', 'me', 'asked', 'the']
  },
  {
    id: 'play_together',
    phase: PHASES.ACTIVITY_2,
    setting: SETTINGS.ANYWHERE,
    sentences: [
      'Both friends played together for a long time.',
      'They ran around and had so much fun.'
    ],
    words: ['both', 'friends', 'played', 'together', 'for', 'a', 'long', 'time', 'they', 'ran', 'around', 'and', 'had', 'so', 'much', 'fun']
  },
  {
    id: 'share_snack',
    phase: PHASES.ACTIVITY_2,
    setting: SETTINGS.ANYWHERE,
    sentences: [
      '{name} gave some snacks to share with friends.',
      '"These are for you," said {name}. "I made them myself!"'
    ],
    words: ['gave', 'some', 'snacks', 'to', 'share', 'with', 'friends', 'these', 'are', 'for', 'you', 'said', 'i', 'made', 'them', 'myself']
  },
  {
    id: 'read_book',
    phase: PHASES.ACTIVITY_2,
    setting: SETTINGS.ANYWHERE,
    sentences: [
      '{name} found a good book to read.',
      'The story would tell about many adventures.'
    ],
    words: ['found', 'a', 'good', 'book', 'to', 'read', 'the', 'story', 'would', 'tell', 'about', 'many', 'adventures']
  },
  {
    id: 'sing_song',
    phase: PHASES.ACTIVITY_2,
    setting: SETTINGS.ANYWHERE,
    sentences: [
      '{name} began to sing a happy song.',
      'The music made everyone want to dance around.'
    ],
    words: ['began', 'to', 'sing', 'a', 'happy', 'song', 'the', 'music', 'made', 'everyone', 'want', 'dance', 'around']
  },
  {
    id: 'count_things',
    phase: PHASES.ACTIVITY_2,
    setting: SETTINGS.ANYWHERE,
    sentences: [
      '{name} counted eight birds sitting on the fence.',
      'Then five more came, which made many birds in all!'
    ],
    words: ['counted', 'eight', 'birds', 'sitting', 'on', 'the', 'fence', 'then', 'five', 'more', 'came', 'which', 'made', 'many', 'in', 'all']
  },
  {
    id: 'try_hard',
    phase: PHASES.ACTIVITY_3,
    setting: SETTINGS.ANYWHERE,
    sentences: [
      'It was hard work, but {name} did not give up.',
      '"I will try again," said {name}. "I can do this!"'
    ],
    words: ['it', 'was', 'hard', 'work', 'but', 'did', 'not', 'give', 'up', 'i', 'will', 'try', 'again', 'said', 'can', 'do', 'this']
  },
  {
    id: 'ask_why',
    phase: PHASES.ACTIVITY_3,
    setting: SETTINGS.ANYWHERE,
    sentences: [
      '"Why does it work that way?" asked {name}.',
      'Mom smiled and said, "Let me tell you."'
    ],
    words: ['why', 'does', 'it', 'work', 'that', 'way', 'asked', 'mom', 'smiled', 'and', 'said', 'let', 'me', 'tell', 'you']
  },
  {
    id: 'write_story',
    phase: PHASES.ACTIVITY_3,
    setting: SETTINGS.ANYWHERE,
    sentences: [
      '{name} wanted to write a story of their own.',
      '"I will use all the words I know," said {name}.'
    ],
    words: ['wanted', 'to', 'write', 'a', 'story', 'of', 'their', 'own', 'i', 'will', 'use', 'all', 'the', 'words', 'know', 'said']
  },
  {
    id: 'sit_rest',
    phase: PHASES.ACTIVITY_3,
    setting: SETTINGS.ANYWHERE,
    sentences: [
      'After all that work, it was time to sit down and rest.',
      '{name} sat on a bench and thought about the fun day.'
    ],
    words: ['after', 'all', 'that', 'work', 'it', 'was', 'time', 'to', 'sit', 'down', 'and', 'rest', 'sat', 'on', 'a', 'bench', 'thought', 'about', 'fun', 'day']
  },
  {
    id: 'buy_treat',
    phase: PHASES.ACTIVITY_3,
    setting: SETTINGS.STORE,
    sentences: [
      'They went to buy a cold treat from the store.',
      'The ice cream was very good on such a warm day.'
    ],
    words: ['they', 'went', 'to', 'buy', 'a', 'cold', 'treat', 'from', 'the', 'store', 'ice', 'cream', 'was', 'very', 'good', 'on', 'such', 'warm', 'day']
  },
  {
    id: 'call_friend',
    phase: PHASES.ACTIVITY_1,
    setting: SETTINGS.ANYWHERE,
    sentences: [
      '{name} wanted to call a friend on the phone.',
      '"Can you come over to play?" {name} asked.'
    ],
    words: ['wanted', 'to', 'call', 'a', 'friend', 'on', 'the', 'phone', 'can', 'you', 'come', 'over', 'play', 'asked']
  },
  {
    id: 'find_something',
    phase: PHASES.ACTIVITY_2,
    setting: SETTINGS.OUTSIDE,
    sentences: [
      '{name} found something round and shiny on the ground.',
      '"What is this?" {name} asked. "I have never seen one before!"'
    ],
    words: ['found', 'something', 'round', 'and', 'shiny', 'on', 'the', 'ground', 'what', 'is', 'this', 'asked', 'i', 'have', 'never', 'seen', 'one', 'before']
  },
  {
    id: 'look_flowers',
    phase: PHASES.ACTIVITY_2,
    setting: SETTINGS.OUTSIDE,
    sentences: [
      '{name} looked around at all the pretty flowers.',
      'There were so many colors - red, yellow, and blue!'
    ],
    words: ['looked', 'around', 'at', 'all', 'the', 'pretty', 'flowers', 'there', 'were', 'so', 'many', 'colors', 'red', 'yellow', 'and', 'blue']
  },
  {
    id: 'see_animals',
    phase: PHASES.ACTIVITY_2,
    setting: SETTINGS.OUTSIDE,
    sentences: [
      '"Look at those animals!" said {name}.',
      'A rabbit and its babies were playing by the tree.'
    ],
    words: ['look', 'at', 'those', 'animals', 'said', 'a', 'rabbit', 'and', 'its', 'babies', 'were', 'playing', 'by', 'the', 'tree']
  },
  {
    id: 'kind_help',
    phase: PHASES.ACTIVITY_2,
    setting: SETTINGS.ANYWHERE,
    sentences: [
      '{name} always tries to help others.',
      'Being kind is the right thing to do.'
    ],
    words: ['always', 'tries', 'to', 'help', 'others', 'being', 'kind', 'is', 'the', 'right', 'thing', 'do']
  },
  {
    id: 'give_gift',
    phase: PHASES.ACTIVITY_2,
    setting: SETTINGS.ANYWHERE,
    sentences: [
      '{name} had been working on a special gift.',
      '"I made this for you because you are my best friend."'
    ],
    words: ['had', 'been', 'working', 'on', 'a', 'special', 'gift', 'i', 'made', 'this', 'for', 'you', 'because', 'are', 'my', 'best', 'friend']
  },
  {
    id: 'learn_new',
    phase: PHASES.ACTIVITY_2,
    setting: SETTINGS.SCHOOL,
    sentences: [
      'At school, {name} learned five new things.',
      '"Why does that work?" {name} asked the teacher.'
    ],
    words: ['at', 'school', 'learned', 'five', 'new', 'things', 'why', 'does', 'that', 'work', 'asked', 'the', 'teacher']
  },
  {
    id: 'feel_happy',
    phase: PHASES.ACTIVITY_3,
    setting: SETTINGS.ANYWHERE,
    sentences: [
      '{name} felt very happy because everything went well.',
      'A big smile came across their face.'
    ],
    words: ['felt', 'very', 'happy', 'because', 'everything', 'went', 'well', 'a', 'big', 'smile', 'came', 'across', 'their', 'face']
  },
  {
    id: 'proud_work',
    phase: PHASES.ACTIVITY_3,
    setting: SETTINGS.ANYWHERE,
    sentences: [
      '{name} was proud of all the hard work.',
      '"I did my best," {name} said with a smile.'
    ],
    words: ['was', 'proud', 'of', 'all', 'the', 'hard', 'work', 'i', 'did', 'my', 'best', 'said', 'with', 'a', 'smile']
  },
  {
    id: 'off_adventure',
    phase: PHASES.ACTIVITY_1,
    setting: SETTINGS.OUTSIDE,
    sentences: [
      '{name} was off on a new adventure!',
      'Who knows what they would find today?'
    ],
    words: ['was', 'off', 'on', 'a', 'new', 'adventure', 'who', 'knows', 'what', 'they', 'would', 'find', 'today']
  },
  {
    id: 'their_toys',
    phase: PHASES.ACTIVITY_1,
    setting: SETTINGS.ANYWHERE,
    sentences: [
      'The children brought out their favorite toys.',
      'These were the ones they always played with.'
    ],
    words: ['the', 'children', 'brought', 'out', 'their', 'favorite', 'toys', 'these', 'were', 'ones', 'they', 'always', 'played', 'with']
  },
  {
    id: 'come_see',
    phase: PHASES.ACTIVITY_2,
    setting: SETTINGS.ANYWHERE,
    sentences: [
      '"Come and see what I found!" called {name}.',
      'Everyone ran over to take a look.'
    ],
    words: ['come', 'and', 'see', 'what', 'i', 'found', 'called', 'everyone', 'ran', 'over', 'to', 'take', 'a', 'look']
  },

  // ============ PHASE 8: RETURN HOME ============
  {
    id: 'time_go_home',
    phase: PHASES.RETURN_HOME,
    setting: SETTINGS.OUTSIDE,
    sentences: [
      'It was getting late, and it was time to go home.',
      '{name} said goodbye to all the friends.'
    ],
    words: ['it', 'was', 'getting', 'late', 'and', 'time', 'to', 'go', 'home', 'said', 'goodbye', 'all', 'the', 'friends']
  },
  {
    id: 'walk_home',
    phase: PHASES.RETURN_HOME,
    setting: SETTINGS.OUTSIDE,
    sentences: [
      '{name} walked home as the sun began to set.',
      'The sky turned pretty colors of orange and pink.'
    ],
    words: ['walked', 'home', 'as', 'the', 'sun', 'began', 'to', 'set', 'sky', 'turned', 'pretty', 'colors', 'of', 'orange', 'and', 'pink']
  },

  // ============ PHASE 9: EVENING ============
  {
    id: 'dinner_time',
    phase: PHASES.EVENING,
    setting: SETTINGS.HOME,
    sentences: [
      'The family sat down for dinner together.',
      '{name} told everyone about the full day of fun.'
    ],
    words: ['the', 'family', 'sat', 'down', 'for', 'dinner', 'together', 'told', 'everyone', 'about', 'full', 'day', 'of', 'fun']
  },
  {
    id: 'bedtime_read',
    phase: PHASES.EVENING,
    setting: SETTINGS.HOME,
    sentences: [
      'Before bed, Mom read a story to {name}.',
      'It was about a brave child who went on an adventure.'
    ],
    words: ['before', 'bed', 'mom', 'read', 'a', 'story', 'to', 'it', 'was', 'about', 'brave', 'child', 'who', 'went', 'on', 'an', 'adventure']
  },

  // ============ PHASE 10: BEDTIME ============
  {
    id: 'sleep_happy',
    phase: PHASES.BEDTIME,
    setting: SETTINGS.HOME,
    sentences: [
      'It had been a very good day.',
      '{name} went to sleep with a happy heart, ready for more fun tomorrow.'
    ],
    words: ['it', 'had', 'been', 'a', 'very', 'good', 'day', 'went', 'to', 'sleep', 'with', 'happy', 'heart', 'ready', 'for', 'more', 'fun', 'tomorrow']
  },
  {
    id: 'best_day',
    phase: PHASES.BEDTIME,
    setting: SETTINGS.HOME,
    sentences: [
      'This was one of the best days ever!',
      '{name} could not wait to do it all again.'
    ],
    words: ['this', 'was', 'one', 'of', 'the', 'best', 'days', 'ever', 'could', 'not', 'wait', 'to', 'do', 'it', 'all', 'again']
  },
  {
    id: 'remember_day',
    phase: PHASES.BEDTIME,
    setting: SETTINGS.HOME,
    sentences: [
      '{name} would always remember this special day.',
      'It was full of fun, friends, and many good things.'
    ],
    words: ['would', 'always', 'remember', 'this', 'special', 'day', 'it', 'was', 'full', 'of', 'fun', 'friends', 'and', 'many', 'good', 'things']
  },
  {
    id: 'dream_tonight',
    phase: PHASES.BEDTIME,
    setting: SETTINGS.HOME,
    sentences: [
      'As {name} drifted off to sleep, dreams of the day came.',
      'What a wonderful time it had been!'
    ],
    words: ['as', 'drifted', 'off', 'to', 'sleep', 'dreams', 'of', 'the', 'day', 'came', 'what', 'a', 'wonderful', 'time', 'it', 'had', 'been']
  }
];

/**
 * Get all unique words covered by the scene library
 */
export const getAllSceneWords = () => {
  const allWords = new Set();
  sceneLibrary.forEach(scene => {
    scene.words.forEach(word => allWords.add(word.toLowerCase()));
  });
  return Array.from(allWords);
};

export default sceneLibrary;
