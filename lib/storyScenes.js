// lib/storyScenes.js

/**
 * Scene-Based Story Composition System
 *
 * Stories follow the phases in PHASES below, in order from WAKE_UP to BEDTIME.
 *
 * Each scene has a phase number to enforce temporal order. A scene's words
 * are read from its sentences (lib/storyComposer.js), so they can't drift
 * from the text.
 *
 * Scenes can also say what they introduce and rely on, so a story never
 * mentions someone who hasn't appeared:
 * - gives: what the scene introduces ('friend', 'mom' out with the child,
 *   'company' for anyone else there)
 * - needs: what an earlier scene must have introduced
 * - group: scenes on the same topic; a story uses at most one from a group
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

/**
 * Library of story scenes with temporal ordering
 */
export const sceneLibrary = [
  // ============ PHASE 1: WAKE UP ============
  {
    id: 'morning_wake',
    phase: PHASES.WAKE_UP,
    sentences: [
      'One morning, {name} woke up very early.',
      'The sun was bright, and it was going to be a good day.'
    ]
  },
  {
    id: 'excited_morning',
    phase: PHASES.WAKE_UP,
    sentences: [
      '{name} jumped out of bed with a big smile.',
      '"Today is going to be the best day!" said {name}.'
    ]
  },
  {
    id: 'special_day_start',
    phase: PHASES.WAKE_UP,
    sentences: [
      'This was no ordinary day for {name}.',
      'Something very special was about to happen.'
    ]
  },

  // ============ PHASE 2: MORNING ROUTINE ============
  {
    id: 'wash_up',
    phase: PHASES.MORNING_ROUTINE,
    sentences: [
      'First, {name} went to wash up.',
      'The cold water helped {name} feel awake and ready.'
    ]
  },
  {
    id: 'get_dressed',
    phase: PHASES.MORNING_ROUTINE,
    sentences: [
      '{name} put on the best clothes from the closet.',
      '"Which shirt should I use today?" wondered {name}.'
    ]
  },
  {
    id: 'eat_breakfast',
    phase: PHASES.MORNING_ROUTINE,
    sentences: [
      'Mom made a full breakfast for everyone.',
      '{name} ate quickly because there was so much to do.'
    ]
  },

  // ============ PHASE 3: LEAVE HOME ============
  {
    id: 'go_outside',
    phase: PHASES.LEAVE_HOME,
    sentences: [
      'After getting ready, {name} went outside.',
      'The air was fresh and the sky was very blue.'
    ]
  },
  {
    id: 'leave_with_mom',
    phase: PHASES.LEAVE_HOME,
    gives: ['mom', 'company'],
    sentences: [
      '"Let us go now," said Mom.',
      '{name} was very excited to leave the house.'
    ]
  },

  // ============ PHASE 4: TRAVEL ============
  {
    id: 'walk_around',
    phase: PHASES.TRAVEL,
    sentences: [
      '{name} took a walk around the block.',
      'Many birds were singing in the trees along the way.'
    ]
  },
  {
    id: 'ride_bike',
    phase: PHASES.TRAVEL,
    sentences: [
      '{name} wanted to ride a bike around the neighborhood.',
      'Going fast down the road was always the best part!'
    ]
  },

  // ============ PHASE 5-7: ACTIVITIES ============
  {
    id: 'arrive_park',
    phase: PHASES.ACTIVITY_1,
    sentences: [
      'At the park, {name} found many things to do.',
      'There were swings, slides, and a big round sandbox.'
    ]
  },
  {
    id: 'meet_friend',
    phase: PHASES.ACTIVITY_1,
    gives: ['friend', 'company'],
    sentences: [
      'A friend came over to say hello.',
      '"Do you want to play with me?" asked the friend.'
    ]
  },
  {
    id: 'play_together',
    phase: PHASES.ACTIVITY_2,
    needs: ['friend'],
    sentences: [
      'Both friends played together for a long time.',
      'They ran around and had so much fun.'
    ]
  },
  {
    id: 'share_snack',
    phase: PHASES.ACTIVITY_2,
    needs: ['friend'],
    sentences: [
      '{name} gave some snacks to share with friends.',
      '"These are for you," said {name}. "I made them myself!"'
    ]
  },
  {
    id: 'read_book',
    phase: PHASES.ACTIVITY_2,
    sentences: [
      '{name} found a good book to read.',
      'The story would tell about many adventures.'
    ]
  },
  {
    id: 'sing_song',
    phase: PHASES.ACTIVITY_2,
    sentences: [
      '{name} began to sing a happy song.',
      'The music made everyone want to dance around.'
    ]
  },
  {
    id: 'count_things',
    phase: PHASES.ACTIVITY_2,
    sentences: [
      '{name} counted eight birds sitting on the fence.',
      'Then five more came, which made many birds in all!'
    ]
  },
  {
    id: 'try_hard',
    phase: PHASES.ACTIVITY_3,
    group: 'hard_work',
    sentences: [
      'It was hard work, but {name} did not give up.',
      '"I will try again," said {name}. "I can do this!"'
    ]
  },
  {
    id: 'ask_why',
    phase: PHASES.ACTIVITY_3,
    needs: ['mom'],
    group: 'why_question',
    sentences: [
      '"Why does it work that way?" asked {name}.',
      'Mom smiled and said, "Let me tell you."'
    ]
  },
  {
    id: 'write_story',
    phase: PHASES.ACTIVITY_3,
    sentences: [
      '{name} wanted to write a story of their own.',
      '"I will use all the words I know," said {name}.'
    ]
  },
  {
    id: 'sit_rest',
    phase: PHASES.ACTIVITY_3,
    sentences: [
      'After all that work, it was time to sit down and rest.',
      '{name} sat on a bench and thought about the fun day.'
    ]
  },
  {
    id: 'buy_treat',
    phase: PHASES.ACTIVITY_3,
    needs: ['company'],
    sentences: [
      'They went to buy a cold treat from the store.',
      'The ice cream was very good on such a warm day.'
    ]
  },
  {
    id: 'call_friend',
    phase: PHASES.ACTIVITY_1,
    gives: ['friend', 'company'],
    sentences: [
      '{name} wanted to call a friend on the phone.',
      '"Can you come over to play?" {name} asked.'
    ]
  },
  {
    id: 'find_something',
    phase: PHASES.ACTIVITY_2,
    sentences: [
      '{name} found something round and shiny on the ground.',
      '"What is this?" {name} asked. "I have never seen one before!"'
    ]
  },
  {
    id: 'look_flowers',
    phase: PHASES.ACTIVITY_2,
    sentences: [
      '{name} looked around at all the pretty flowers.',
      'There were so many colors - red, yellow, and blue!'
    ]
  },
  {
    id: 'see_animals',
    phase: PHASES.ACTIVITY_2,
    sentences: [
      '"Look at those animals!" said {name}.',
      'A rabbit and its babies were playing by the tree.'
    ]
  },
  {
    id: 'kind_help',
    phase: PHASES.ACTIVITY_2,
    sentences: [
      '{name} always tries to help others.',
      'Being kind is the right thing to do.'
    ]
  },
  {
    id: 'give_gift',
    phase: PHASES.ACTIVITY_2,
    needs: ['friend'],
    sentences: [
      '{name} had been working on a special gift.',
      '"I made this for you because you are my best friend."'
    ]
  },
  {
    id: 'learn_new',
    phase: PHASES.ACTIVITY_2,
    group: 'why_question',
    sentences: [
      'At school, {name} learned five new things.',
      '"Why does that work?" {name} asked the teacher.'
    ]
  },
  {
    id: 'feel_happy',
    phase: PHASES.ACTIVITY_3,
    sentences: [
      '{name} felt very happy because everything went well.',
      'A big smile came across their face.'
    ]
  },
  {
    id: 'proud_work',
    phase: PHASES.ACTIVITY_3,
    group: 'hard_work',
    sentences: [
      '{name} was proud of all the hard work.',
      '"I did my best," {name} said with a smile.'
    ]
  },
  {
    id: 'off_adventure',
    phase: PHASES.ACTIVITY_1,
    sentences: [
      '{name} was off on a new adventure!',
      'Who knows what they would find today?'
    ]
  },
  {
    id: 'their_toys',
    phase: PHASES.ACTIVITY_1,
    gives: ['friend', 'company'],
    sentences: [
      'The children brought out their favorite toys.',
      'These were the ones they always played with.'
    ]
  },
  {
    id: 'come_see',
    phase: PHASES.ACTIVITY_2,
    needs: ['company'],
    sentences: [
      '"Come and see what I found!" called {name}.',
      'Everyone ran over to take a look.'
    ]
  },

  // ============ PHASE 8: RETURN HOME ============
  {
    id: 'time_go_home',
    phase: PHASES.RETURN_HOME,
    needs: ['friend'],
    sentences: [
      'It was getting late, and it was time to go home.',
      '{name} said goodbye to all the friends.'
    ]
  },
  {
    id: 'walk_home',
    phase: PHASES.RETURN_HOME,
    sentences: [
      '{name} walked home as the sun began to set.',
      'The sky turned pretty colors of orange and pink.'
    ]
  },

  // ============ PHASE 9: EVENING ============
  {
    id: 'dinner_time',
    phase: PHASES.EVENING,
    sentences: [
      'The family sat down for dinner together.',
      '{name} told everyone about the full day of fun.'
    ]
  },
  {
    id: 'bedtime_read',
    phase: PHASES.EVENING,
    sentences: [
      'Before bed, Mom read a story to {name}.',
      'It was about a brave child who went on an adventure.'
    ]
  },

  // ============ PHASE 10: BEDTIME ============
  {
    id: 'sleep_happy',
    phase: PHASES.BEDTIME,
    sentences: [
      'It had been a very good day.',
      '{name} went to sleep with a happy heart, ready for more fun tomorrow.'
    ]
  },
  {
    id: 'best_day',
    phase: PHASES.BEDTIME,
    sentences: [
      'This was one of the best days ever!',
      '{name} could not wait to do it all again.'
    ]
  },
  {
    id: 'remember_day',
    phase: PHASES.BEDTIME,
    needs: ['friend'],
    sentences: [
      '{name} would always remember this special day.',
      'It was full of fun, friends, and many good things.'
    ]
  },
  {
    id: 'dream_tonight',
    phase: PHASES.BEDTIME,
    sentences: [
      'As {name} drifted off to sleep, dreams of the day came.',
      'What a wonderful time it had been!'
    ]
  }
];
