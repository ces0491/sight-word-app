/**
 * What to draw for each scene in lib/storyScenes.js.
 *
 * Classic stories know which scene each sentence came from, so their
 * illustrations follow these specs instead of guessing from keywords.
 *
 * Fields (all optional except characters):
 * - location: bedroom | bathroom | kitchen | classroom | home | street | park
 *   | garden | hill | store | outside. Omitted means "carry on from the
 *   previous page" (see planIllustrations in lib/imageGeneration.js).
 * - timeOfDay: morning | day | evening | night
 * - characters: roles from the story's cast (child, mom, dad, teacher,
 *   friend, friend2), drawn left to right
 * - action: pose for the standing characters
 * - emotion: happy | sad | surprised | proud | tired
 * - inBed: 'awake' or 'asleep' draws the child in bed
 * - roomProps: extra furniture for indoor rooms (wardrobe)
 * - animals, vehicles, foodItems, objects: props to draw
 */
export const SCENE_ILLUSTRATIONS = {
  // Wake up
  morning_wake: { location: 'bedroom', timeOfDay: 'morning', characters: ['child'], inBed: 'awake' },
  excited_morning: { location: 'bedroom', timeOfDay: 'morning', characters: ['child'], action: 'jumping' },
  special_day_start: { location: 'bedroom', timeOfDay: 'morning', characters: ['child'], action: 'waving', emotion: 'surprised' },

  // Morning routine
  wash_up: { location: 'bathroom', timeOfDay: 'morning', characters: ['child'], action: 'washing' },
  get_dressed: { location: 'bedroom', timeOfDay: 'morning', characters: ['child'], roomProps: ['wardrobe'] },
  eat_breakfast: { location: 'kitchen', timeOfDay: 'morning', characters: ['mom', 'child'], action: 'eating' },

  // Leave home
  go_outside: { location: 'home', timeOfDay: 'morning', characters: ['child'], action: 'walking' },
  leave_with_mom: { location: 'home', timeOfDay: 'morning', characters: ['mom', 'child'], action: 'walking' },

  // Travel
  walk_around: { location: 'street', characters: ['child'], action: 'walking', animals: ['bird', 'bird'] },
  ride_bike: { location: 'street', characters: ['child'], action: 'riding', vehicles: ['bike'] },

  // Activities
  arrive_park: { location: 'park', characters: ['child'], action: 'playing', objects: ['swing', 'ball'] },
  meet_friend: { characters: ['child', 'friend'], action: 'waving' },
  play_together: { characters: ['child', 'friend'], action: 'jumping', objects: ['ball'] },
  share_snack: { characters: ['child', 'friend'], action: 'sharing', foodItems: ['cookie'] },
  read_book: { characters: ['child'], action: 'reading' },
  sing_song: { characters: ['child', 'friend'], action: 'singing' },
  count_things: { location: 'park', characters: ['child'], action: 'counting', animals: ['bird', 'bird', 'bird'] },
  try_hard: { characters: ['child'], emotion: 'proud', objects: ['kite'] },
  ask_why: { characters: ['mom', 'child'], emotion: 'surprised' },
  write_story: { characters: ['child'], action: 'writing' },
  sit_rest: { location: 'park', characters: ['child'], action: 'sitting', objects: ['bench'] },
  buy_treat: { location: 'store', characters: ['mom', 'child'], foodItems: ['icecream'] },
  call_friend: { characters: ['child'], action: 'calling' },
  find_something: { location: 'outside', characters: ['child'], action: 'looking', objects: ['coin'] },
  look_flowers: { location: 'garden', characters: ['child'], action: 'looking', objects: ['flower'] },
  see_animals: { location: 'park', characters: ['child'], action: 'looking', animals: ['rabbit'] },
  kind_help: { characters: ['child', 'friend'], action: 'hugging' },
  give_gift: { characters: ['child', 'friend'], action: 'sharing', objects: ['gift'] },
  learn_new: { location: 'classroom', characters: ['teacher', 'child'] },
  feel_happy: { characters: ['child'], action: 'jumping' },
  proud_work: { characters: ['child'], emotion: 'proud', objects: ['star'] },
  off_adventure: { location: 'hill', characters: ['child'], action: 'walking' },
  their_toys: { characters: ['child', 'friend'], action: 'playing', objects: ['ball', 'balloon'] },
  come_see: { characters: ['child', 'friend', 'friend2'], action: 'waving' },

  // Return home
  time_go_home: { timeOfDay: 'evening', characters: ['child', 'friend'], action: 'waving' },
  walk_home: { location: 'street', timeOfDay: 'evening', characters: ['child'], action: 'walking' },

  // Evening
  dinner_time: { location: 'kitchen', timeOfDay: 'evening', characters: ['mom', 'child', 'dad'], action: 'eating' },
  bedtime_read: { location: 'bedroom', timeOfDay: 'night', characters: ['child', 'mom'], inBed: 'awake', action: 'reading' },

  // Bedtime
  sleep_happy: { location: 'bedroom', timeOfDay: 'night', characters: ['child'], inBed: 'asleep' },
  best_day: { location: 'bedroom', timeOfDay: 'night', characters: ['child'], inBed: 'asleep' },
  remember_day: { location: 'bedroom', timeOfDay: 'night', characters: ['child'], inBed: 'asleep' },
  dream_tonight: { location: 'bedroom', timeOfDay: 'night', characters: ['child'], inBed: 'asleep' },
};
