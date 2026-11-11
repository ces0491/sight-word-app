import React from 'react';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SightWordStoryGenerator from '../SightWordStoryGenerator';
import { answerGate } from '../../test/gateHelpers';
import { STARTER_WORDS } from '../../lib/wordLists';
import { loadAnthropicKey, storeAnthropicKey } from '../../lib/anthropicKey';
import { LIBRARY_KEY, getSavedStories } from '../../lib/storyLibrary';
import { readShareLink } from '../../lib/shareLink';
import { writeAiStory } from '../../lib/aiStory';

// OCR pulls in tesseract.js, which isn't needed here
jest.mock('../ImageUpload', () => () => null);
// AI stories call Anthropic; lib/__tests__/aiStory.test.js covers that module
jest.mock('../../lib/aiStory', () => ({ writeAiStory: jest.fn() }));

const testKey = 'test-key-abcd';
const aiStory = { title: 'The AI Dog', content: ['The dog can run.'], usedWords: ['the', 'can'] };

const openGrownUps = async (user) => {
  await user.click(screen.getByRole('button', { name: 'Grown-ups' }));
  if (screen.queryByText(/What is \d+ \+ \d+\?/)) {
    await user.type(screen.getByRole('textbox'), answerGate());
    await user.click(screen.getByRole('button', { name: 'Open grown-ups' }));
  }
  await screen.findByRole('heading', { name: 'Grown-ups', level: 1 });
};

const makeClassicStory = async (user) => {
  await user.click(screen.getByRole('button', { name: 'Try some words' }));
  await user.click(screen.getByRole('button', { name: 'Make my story' }));
  await screen.findByRole('article', { name: /Page 1 of/ });
};

const readToTheEnd = async (user) => {
  for (let i = 0; i < 60 && !screen.queryByRole('heading', { name: 'The end!' }); i++) {
    await user.click(screen.getByRole('button', { name: 'Next' }));
  }
  expect(screen.getByRole('heading', { name: 'The end!' })).toBeInTheDocument();
};

beforeEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
  writeAiStory.mockReset();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  delete global.fetch;
});

describe('story time', () => {
  it('starts with a way to try some words or ask a grown-up', async () => {
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);

    expect(screen.getByRole('heading', { name: 'Story time!' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try some words' }));

    const cards = within(screen.getByRole('list', { name: 'Your words' })).getAllByRole('listitem');
    expect(cards.map((card) => card.textContent)).toEqual(STARTER_WORDS);
  });

  it('makes a Classic story in the browser and opens the reader', async () => {
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);

    await makeClassicStory(user);

    expect(writeAiStory).not.toHaveBeenCalled();
  });

  it('puts the story on the "Read again" shelf after closing the reader', async () => {
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);

    await makeClassicStory(user);
    await user.click(screen.getByRole('button', { name: 'Done' }));

    expect(screen.getByRole('heading', { name: 'Read again' })).toBeInTheDocument();
  });
});

describe('saving and sharing', () => {
  it('saves the story in this browser, then lists it under Grown-ups', async () => {
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);

    await makeClassicStory(user);
    await readToTheEnd(user);
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByRole('button', { name: 'Saved' })).toBeDisabled();
    expect(screen.getByText('Story saved in this browser.')).toBeInTheDocument();
    const [saved] = getSavedStories();
    expect(saved.words).toEqual(STARTER_WORDS);

    await user.click(screen.getByRole('button', { name: 'Done' }));
    await openGrownUps(user);
    const savedSection = screen.getByRole('region', { name: 'Saved stories' });
    expect(within(savedSection).getByText(saved.title)).toBeInTheDocument();
  });

  it('says why when the browser has no room to save', async () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key) => {
      if (key === LIBRARY_KEY) throw new DOMException('full', 'QuotaExceededError');
    });
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);

    await makeClassicStory(user);
    await readToTheEnd(user);
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText(/This browser has no room for more stories/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  it('shares the story being read through a link that holds it, without saving it', async () => {
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);

    await makeClassicStory(user);
    const title = screen.getAllByRole('heading', { level: 1 })[0].textContent;
    await readToTheEnd(user);
    await user.click(screen.getByRole('button', { name: 'Share' }));

    const dialog = screen.getByRole('dialog', { name: 'Share this story' });
    const field = await within(dialog).findByLabelText('Link to the story');
    expect((await readShareLink(new URL(field.value).hash)).title).toBe(title);
    expect(getSavedStories()).toEqual([]);
  });

  it('sends nothing to a server while making, saving and sharing a story', async () => {
    global.fetch = jest.fn();
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);

    await makeClassicStory(user);
    await readToTheEnd(user);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await user.click(screen.getByRole('button', { name: 'Share' }));
    await screen.findByLabelText('Link to the story');

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows stories saved in another tab', async () => {
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);
    await openGrownUps(user);
    expect(screen.getByText('No saved stories yet. Save one from the last page of a story.')).toBeInTheDocument();

    const fromOtherTab = {
      id: 'other-tab',
      title: 'From the Other Tab',
      content: ['I see a cat.'],
      words: ['see'],
      grade: 0,
      createdAt: '2026-11-10T08:00:00.000Z',
    };
    act(() => {
      window.localStorage.setItem(LIBRARY_KEY, JSON.stringify([fromOtherTab]));
      window.dispatchEvent(new StorageEvent('storage', { key: LIBRARY_KEY }));
    });

    expect(screen.getByText('From the Other Tab')).toBeInTheDocument();
  });
});

describe('grown-ups', () => {
  it('asks the sum once per tab', async () => {
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);

    await user.click(screen.getByRole('button', { name: 'Grown-ups' }));
    expect(screen.getByRole('dialog', { name: 'Grown-ups only' })).toBeInTheDocument();
    await user.type(screen.getByRole('textbox'), answerGate());
    await user.click(screen.getByRole('button', { name: 'Open grown-ups' }));
    await screen.findByRole('heading', { name: 'Grown-ups', level: 1 });

    await user.click(screen.getByRole('button', { name: 'Back to story time' }));
    await user.click(screen.getByRole('button', { name: 'Grown-ups' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Grown-ups', level: 1 })).toBeInTheDocument();
  });

  it('cleans punctuation from typed words', async () => {
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);
    await openGrownUps(user);

    await user.type(screen.getByLabelText(/Words to add/), 'Dog. cat! "see"');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    ['dog', 'cat', 'see'].forEach((word) => expect(screen.getByRole('button', { name: `Remove ${word}` })).toBeInTheDocument());
  });

  it('adds words from the Dolch lists', async () => {
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);
    await openGrownUps(user);

    const panel = screen.getByRole('tabpanel', { name: 'Pre-primer words' });
    await user.click(within(panel).getByRole('button', { name: 'jump' }));
    expect(screen.getByRole('button', { name: 'Remove jump' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add all pre-primer words' }));
    expect(screen.getAllByRole('button', { name: /^Remove / })).toHaveLength(40);
  });

  it('offers reading levels from Kindergarten to Grade 3', async () => {
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);
    await openGrownUps(user);

    const options = within(screen.getByLabelText('Reading level')).getAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual(['Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3']);
  });

  it('stops adding words at the story limit and says how many were left out', async () => {
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);
    await openGrownUps(user);

    await user.click(screen.getByRole('button', { name: 'Add all pre-primer words' }));
    await user.click(screen.getByRole('tab', { name: 'Primer' }));
    await user.click(screen.getByRole('button', { name: 'Add all primer words' }));
    await user.click(screen.getByRole('tab', { name: 'First grade' }));
    await user.click(screen.getByRole('button', { name: 'Add all first grade words' }));

    expect(screen.getAllByRole('button', { name: /^Remove / })).toHaveLength(100);
    expect(screen.getByText("Stories can use up to 100 words, so 33 weren't added.")).toBeInTheDocument();
  });

  it('keeps the words and the unsaved story for this tab across a reload', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<SightWordStoryGenerator />);
    await makeClassicStory(user);
    await user.click(screen.getByRole('button', { name: 'Done' }));
    unmount();

    render(<SightWordStoryGenerator />);

    const cards = within(await screen.findByRole('list', { name: 'Your words' })).getAllByRole('listitem');
    expect(cards.map((card) => card.textContent)).toEqual(STARTER_WORDS);
    expect(screen.getByRole('heading', { name: 'Read again' })).toBeInTheDocument();
  });
});

describe('Anthropic API key', () => {
  it('turns on AI stories once a key is saved, and off when it is removed', async () => {
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);
    await openGrownUps(user);

    expect(screen.getByRole('button', { name: 'AI' })).toBeDisabled();
    expect(screen.getByText('Add your Anthropic API key under AI stories to use them.')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Anthropic API key'), `  ${testKey} `);
    await user.click(screen.getByRole('button', { name: 'Save key in this browser' }));

    expect(screen.getByRole('button', { name: 'AI' })).toBeEnabled();
    expect(screen.getByText('A key ending in abcd is saved in this browser.')).toBeInTheDocument();
    expect(loadAnthropicKey()).toBe(testKey);

    await user.click(screen.getByRole('button', { name: 'Remove key' }));

    expect(screen.getByRole('button', { name: 'AI' })).toBeDisabled();
    expect(loadAnthropicKey()).toBeNull();
  });

  it('says where the key is kept and how to limit it, before and after a key is saved', async () => {
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);
    await openGrownUps(user);

    const field = screen.getByLabelText('Anthropic API key');
    expect(screen.getByRole('heading', { name: 'Where your key is kept' })).toBeInTheDocument();
    expect(field).toHaveAccessibleDescription(/saved in this browser, on this device, until you press Remove key/);
    expect(field).toHaveAccessibleDescription(/anyone using this browser can make stories billed to you/);
    expect(screen.getByText(/choose an expiry when you create it/)).toBeInTheDocument();
    expect(screen.getByText(/give that workspace a low monthly spend limit/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Anthropic Console' })).toHaveAttribute(
      'href',
      'https://platform.claude.com/settings/keys'
    );
    expect(screen.getByRole('link', { name: 'workspace' })).toHaveAttribute(
      'href',
      'https://platform.claude.com/settings/workspaces'
    );

    await user.type(field, testKey);
    await user.click(screen.getByRole('button', { name: 'Save key in this browser' }));

    expect(screen.getByRole('heading', { name: 'Where your key is kept' })).toBeInTheDocument();
    expect(screen.getByText(/Remove key here only takes it out of this browser/)).toBeInTheDocument();
  });

  it('uses a key saved earlier in this browser', async () => {
    storeAnthropicKey(testKey);
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);
    await openGrownUps(user);

    expect(screen.getByRole('button', { name: 'AI' })).toBeEnabled();
  });

  it('removes keys that versions with accounts saved', async () => {
    window.localStorage.setItem('sightwords:anthropic-key:user-1', 'old-key');
    render(<SightWordStoryGenerator />);

    expect(await screen.findByRole('heading', { name: 'Story time!' })).toBeInTheDocument();
    expect(window.localStorage.getItem('sightwords:anthropic-key:user-1')).toBeNull();
  });
});

describe('AI stories', () => {
  beforeEach(() => {
    storeAnthropicKey(testKey);
  });

  const chooseAi = async (user) => {
    await openGrownUps(user);
    await user.click(screen.getByRole('button', { name: 'AI' }));
    await user.click(screen.getByRole('button', { name: 'Back to story time' }));
    await user.click(screen.getByRole('button', { name: 'Try some words' }));
    await user.click(screen.getByRole('button', { name: 'Make my story' }));
  };

  it("writes the story with the grown-up's key and reads it", async () => {
    writeAiStory.mockResolvedValue(aiStory);
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);

    await chooseAi(user);

    expect(await screen.findByRole('article', { name: 'Page 1 of 1' })).toHaveTextContent('The dog can run.');
    expect(screen.getAllByText('The AI Dog').length).toBeGreaterThan(0);
    expect(writeAiStory).toHaveBeenCalledWith(expect.objectContaining({ apiKey: testKey, words: STARTER_WORDS, grade: 1 }));
  });

  it('falls back to Classic and shows the AI error message', async () => {
    writeAiStory.mockRejectedValue(
      Object.assign(new Error("Anthropic didn't accept your API key. Check it under AI stories in Grown-ups."), {
        name: 'AiStoryError',
        code: 'KEY_REJECTED',
      })
    );
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);

    await chooseAi(user);

    expect(
      await screen.findByText("Anthropic didn't accept your API key. Check it under AI stories in Grown-ups. Using Classic mode instead.")
    ).toBeInTheDocument();
    expect(screen.getByRole('article', { name: /Page 1 of/ })).toBeInTheDocument();
  });

  it("doesn't show the text of an unexpected error", async () => {
    writeAiStory.mockRejectedValue(Object.assign(new Error('Loading chunk 42 failed'), { code: 18 }));
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);

    await chooseAi(user);

    expect(await screen.findByText("The AI story didn't work. Using Classic mode instead.")).toBeInTheDocument();
  });
});
