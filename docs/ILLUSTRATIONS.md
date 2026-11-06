# Illustrations

Each sentence of a story gets a picture drawn in code as SVG. No image API is involved, so illustrations cost nothing to generate. The SVG is shown through an `<img>` data URL, so nothing inside it can run script or load other files.

## How a page is drawn

**Classic stories** record which scene each sentence came from (`scenes` on the story, one entry per sentence). A sentence with a scene is drawn from that scene's spec in [`lib/sceneIllustrations.js`](../lib/sceneIllustrations.js): its setting, time of day, who is there, their pose and the props. For example, `eat_breakfast` is Mom and the child at the kitchen table in the morning, and `sleep_happy` is the child asleep in bed at night.

**Other sentences** are drawn from keywords: AI stories, the extra sentences a Classic story adds to cover leftover words, and stories saved before scenes were recorded. `extractElements` in [`lib/imageGeneration.js`](../lib/imageGeneration.js) looks for places, times of day, weather, people, animals, vehicles, food, objects, actions and feelings.

`planIllustrations(story)` works out each page's setting before drawing:

- A page whose scene or text names a place uses it.
- A scene with no fixed place (for example `meet_friend`) stays where the previous page was, unless that was a room in the house, in which case it moves to the park.
- A keyword-only sentence that names no place stays where the previous page was.

## Keeping the characters the same

A story's seed comes from its title and first sentence, so it is the same before and after the story is saved. `createCast(seed)` fixes each role's skin tone, hair and shirt for the whole story, and the seed also drives the remaining randomness (star and snowflake positions). A story renders the same way every time it is shown, shared or printed. The illustration code does not call `Math.random`.

Roles: `child`, `mom`, `dad`, `teacher`, `friend`, `friend2`.

## What can be drawn

| Kind | Drawn |
| --- | --- |
| Indoor settings | bedroom, bathroom, kitchen, classroom ([`lib/illustrationRooms.js`](../lib/illustrationRooms.js)) |
| Outdoor settings | home (house front), park, school, beach, library, store, garden, hill, street; anything else is open grass |
| Sky | morning, day, evening and night; rainy, snowy and cloudy weather. The bedroom and kitchen have a window showing the time of day; the bathroom and classroom have none |
| Poses | standing (also used for walking), jumping, sitting, eating at the table, riding a bike, reading or writing, waving, hugging, calling, singing, and lying in bed awake or asleep. Counting, washing, looking, sharing and playing have no pose of their own and are drawn standing |
| Faces | happy (also used for proud), sad, surprised, neutral |
| Animals | dog, cat, bird, rabbit, butterfly, duck |
| Vehicles | bike, car, bus |
| Food | cake, ice cream, cookie, apple; breakfast and dinner on the kitchen table |
| Objects | ball, book, flower, balloon, gift, swing, kite, bench, coin, star |

Keyword detection also recognises some things that have no drawing yet (fish, bee, horse, cow, train, truck, boat, sandwich, pizza, and several objects). Nothing is drawn for them, and they don't take one of the places in the picture: up to four animals, two vehicles and three objects are drawn, chosen from the kinds that have drawings (`DRAWN_ANIMALS`, `DRAWN_VEHICLES` and `DRAWN_OBJECTS` in [`lib/imageGeneration.js`](../lib/imageGeneration.js)). Snow comes from words such as "snow" and "winter", not "cold" or "ice", so a cold drink or an ice cream isn't drawn in a snowfall.

## Adding a scene

1. Add the scene to `sceneLibrary` in [`lib/storyScenes.js`](../lib/storyScenes.js): an id, a phase and its sentences. Its words are read from the sentences. If it mentions someone who must have appeared already, give it `needs` (and the scene that introduces them `gives`); the comment at the top of that file explains these and `group`.
2. Add a spec with the same id to `SCENE_ILLUSTRATIONS` in [`lib/sceneIllustrations.js`](../lib/sceneIllustrations.js). The comment at the top of that file lists the fields.

A test fails if a scene has no spec, or if a spec names an unknown setting or role. [`lib/__tests__/storyComposer.test.js`](../lib/__tests__/storyComposer.test.js) checks that every Dolch word can still appear and that people are introduced before a scene mentions them.

## Testing

[`lib/__tests__/imageGeneration.test.js`](../lib/__tests__/imageGeneration.test.js) covers keyword detection, the cast, page planning and scene drawing. Major parts of a picture carry a `class` (`room-bedroom`, `in-bed asleep`, `meal-breakfast`, `bench` and so on), which the tests check for, rather than exact colours or coordinates.
