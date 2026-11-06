import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSession, signIn, signOut } from 'next-auth/react';
import SightWordStoryGenerator from '../SightWordStoryGenerator';
import { answerGate } from '../../test/gateHelpers';
import { STARTER_WORDS } from '../../lib/wordLists';
import { loadAnthropicKey, storeAnthropicKey } from '../../lib/anthropicKey';
import { writeAiStory } from '../../lib/aiStory';

jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signIn: jest.fn(), signOut: jest.fn() }));
// OCR pulls in tesseract.js, which isn't needed here
jest.mock('../ImageUpload', () => () => null);
// The usage dashboard fetches on mount; it has its own concerns
jest.mock('../analytics/WordUsageDashboard', () => () => null);
// AI stories call Anthropic; lib/__tests__/aiStory.test.js covers that module
jest.mock('../../lib/aiStory', () => ({ writeAiStory: jest.fn() }));

const signedIn = { data: { user: { id: 'user-1', name: 'Ms Smith' } }, status: 'authenticated' };
const signedOut = { data: null, status: 'unauthenticated' };
const testKey = 'test-key-abcd';

const aiStory = { title: 'The AI Dog', content: ['The dog can run.'], usedWords: ['the', 'can'] };
const savedStory = {
  _id: '64b0c0ffee0000000000abcd',
  title: 'The AI Dog',
  content: ['The dog can run.'],
  scenes: [],
  words: STARTER_WORDS,
  usedWords: ['the', 'can'],
  format: 'highlighted',
  includeImages: true,
  grade: 1,
  learningNeeds: {},
  createdAt: '2026-01-01T00:00:00.000Z',
};

const jsonResponse = (status, body) => Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });

/** Route fetch calls by method and path; anything unlisted returns 200 {}. */
const mockFetch = (routes) => {
  global.fetch = jest.fn((url, options = {}) => {
    const route = routes[`${options.method || 'GET'} ${url}`];
    return route ? jsonResponse(...route) : jsonResponse(200, {});
  });
};

const fetchCalls = (method, url) =>
  global.fetch.mock.calls.filter(([u, o = {}]) => u === url && (o.method || 'GET') === method);

const openGrownUps = async (user) => {
  await user.click(screen.getByRole('button', { name: 'Grown-ups' }));
  if (screen.queryByText(/What is \d+ \+ \d+\?/)) {
    await user.type(screen.getByRole('textbox'), answerGate());
    await user.click(screen.getByRole('button', { name: 'Open grown-ups' }));
  }
  await screen.findByRole('heading', { name: 'Grown-ups', level: 1 });
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
  signOut.mockReset();
  signIn.mockReset();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  delete global.fetch;
});

describe('story time', () => {
  it('starts with a way to try some words or ask a grown-up', async () => {
    useSession.mockReturnValue(signedOut);
    mockFetch({});
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);

    expect(screen.getByRole('heading', { name: 'Story time!' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try some words' }));

    const cards = within(screen.getByRole('list', { name: 'Your words' })).getAllByRole('listitem');
    expect(cards.map((card) => card.textContent)).toEqual(STARTER_WORDS);
  });

  it('makes a Classic story in the browser and opens the reader', async () => {
    useSession.mockReturnValue(signedOut);
    mockFetch({});
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);

    await user.click(screen.getByRole('button', { name: 'Try some words' }));
    await user.click(screen.getByRole('button', { name: 'Make my story' }));

    expect(await screen.findByRole('article', { name: /Page 1 of/ })).toBeInTheDocument();
    expect(writeAiStory).not.toHaveBeenCalled();
  });

  it('puts the story on the "Read again" shelf after closing the reader', async () => {
    useSession.mockReturnValue(signedOut);
    mockFetch({});
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);

    await user.click(screen.getByRole('button', { name: 'Try some words' }));
    await user.click(screen.getByRole('button', { name: 'Make my story' }));
    await user.click(await screen.findByRole('button', { name: 'Done' }));

    expect(screen.getByRole('heading', { name: 'Read again' })).toBeInTheDocument();
  });
});

describe('grown-ups', () => {
  it('asks the sum once per tab', async () => {
    useSession.mockReturnValue(signedOut);
    mockFetch({});
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
    useSession.mockReturnValue(signedOut);
    mockFetch({});
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);
    await openGrownUps(user);

    await user.type(screen.getByLabelText(/Words to add/), 'Dog. cat! "see"');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    ['dog', 'cat', 'see'].forEach((word) => expect(screen.getByRole('button', { name: `Remove ${word}` })).toBeInTheDocument());
  });

  it('adds words from the Dolch lists', async () => {
    useSession.mockReturnValue(signedOut);
    mockFetch({});
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);
    await openGrownUps(user);

    const panel = screen.getByRole('tabpanel', { name: 'Pre-primer words' });
    await user.click(within(panel).getByRole('button', { name: 'jump' }));
    expect(screen.getByRole('button', { name: 'Remove jump' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add all pre-primer words' }));
    expect(screen.getAllByRole('button', { name: /^Remove / })).toHaveLength(40);
  });

  it('keeps AI stories off until a grown-up signs in', async () => {
    useSession.mockReturnValue(signedOut);
    mockFetch({});
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);
    await openGrownUps(user);

    expect(screen.getByRole('button', { name: 'AI' })).toBeDisabled();
    expect(screen.getByText('Sign in to use AI stories.')).toBeInTheDocument();
  });

  it('offers reading levels from Kindergarten to Grade 3', async () => {
    useSession.mockReturnValue(signedOut);
    mockFetch({});
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);
    await openGrownUps(user);

    const options = within(screen.getByLabelText('Reading level')).getAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual(['Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3']);
  });
});

describe('Anthropic API key', () => {
  it('turns on AI stories once a signed-in grown-up saves a key, and off when it is removed', async () => {
    useSession.mockReturnValue(signedIn);
    mockFetch({ 'GET /api/stories': [200, []] });
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);
    await openGrownUps(user);

    expect(screen.getByRole('button', { name: 'AI' })).toBeDisabled();
    expect(screen.getByText('Add your Anthropic API key under Account to use AI stories.')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Anthropic API key'), `  ${testKey} `);
    await user.click(screen.getByRole('button', { name: 'Save key' }));

    expect(screen.getByRole('button', { name: 'AI' })).toBeEnabled();
    expect(screen.getByText('A key ending in abcd is saved in this browser.')).toBeInTheDocument();
    expect(loadAnthropicKey('user-1')).toBe(testKey);

    await user.click(screen.getByRole('button', { name: 'Remove key' }));

    expect(screen.getByRole('button', { name: 'AI' })).toBeDisabled();
    expect(loadAnthropicKey('user-1')).toBeNull();
  });

  it('removes the key from this browser on sign-out', async () => {
    useSession.mockReturnValue(signedIn);
    storeAnthropicKey('user-1', testKey);
    mockFetch({ 'GET /api/stories': [200, []] });
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);
    await openGrownUps(user);

    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(signOut).toHaveBeenCalled();
    expect(loadAnthropicKey('user-1')).toBeNull();
  });
});

describe('AI stories', () => {
  beforeEach(() => {
    storeAnthropicKey('user-1', testKey);
  });

  const chooseAi = async (user) => {
    await openGrownUps(user);
    await user.click(screen.getByRole('button', { name: 'AI' }));
    await user.click(screen.getByRole('button', { name: 'Back to story time' }));
    await user.click(screen.getByRole('button', { name: 'Try some words' }));
    await user.click(screen.getByRole('button', { name: 'Make my story' }));
  };

  it("writes the story with the grown-up's key and reads it", async () => {
    useSession.mockReturnValue(signedIn);
    mockFetch({ 'GET /api/stories': [200, []] });
    writeAiStory.mockResolvedValue(aiStory);
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);

    await chooseAi(user);

    expect(await screen.findByRole('article', { name: 'Page 1 of 1' })).toHaveTextContent('The dog can run.');
    expect(screen.getAllByText('The AI Dog').length).toBeGreaterThan(0);
    expect(writeAiStory).toHaveBeenCalledWith(expect.objectContaining({ apiKey: testKey, words: STARTER_WORDS, grade: 1 }));
  });

  it('falls back to Classic and shows the AI error message', async () => {
    useSession.mockReturnValue(signedIn);
    mockFetch({ 'GET /api/stories': [200, []] });
    writeAiStory.mockRejectedValue(
      Object.assign(new Error("Anthropic didn't accept your API key. Check it under Account in Grown-ups."), {
        name: 'AiStoryError',
        code: 'KEY_REJECTED',
      })
    );
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);

    await chooseAi(user);

    expect(
      await screen.findByText("Anthropic didn't accept your API key. Check it under Account in Grown-ups. Using Classic mode instead.")
    ).toBeInTheDocument();
    expect(screen.getByRole('article', { name: /Page 1 of/ })).toBeInTheDocument();
  });

  it("doesn't show the text of an unexpected error", async () => {
    useSession.mockReturnValue(signedIn);
    mockFetch({ 'GET /api/stories': [200, []] });
    writeAiStory.mockRejectedValue(Object.assign(new Error('Loading chunk 42 failed'), { code: 18 }));
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);

    await chooseAi(user);

    expect(await screen.findByText("The AI story didn't work. Using Classic mode instead.")).toBeInTheDocument();
  });

  it('saves an unsaved story before sharing it by its database id', async () => {
    useSession.mockReturnValue(signedIn);
    writeAiStory.mockResolvedValue(aiStory);
    mockFetch({
      'GET /api/stories': [200, []],
      'POST /api/stories': [201, savedStory],
      [`POST /api/stories/${savedStory._id}/share`]: [200, { success: true }],
    });
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);

    await chooseAi(user);
    await screen.findByRole('article', { name: 'Page 1 of 1' });
    await readToTheEnd(user);

    await user.click(screen.getByRole('button', { name: 'Share' }));
    await user.type(screen.getByLabelText('Email address'), 'teacher@school.edu');
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Share' }));

    await waitFor(() => expect(fetchCalls('POST', `/api/stories/${savedStory._id}/share`)).toHaveLength(1));
    const [saveCall] = fetchCalls('POST', '/api/stories');
    expect(Object.keys(JSON.parse(saveCall[1].body)).sort()).toEqual(
      ['content', 'format', 'grade', 'includeImages', 'learningNeeds', 'scenes', 'title', 'words'].sort()
    );
    const [shareCall] = fetchCalls('POST', `/api/stories/${savedStory._id}/share`);
    expect(JSON.parse(shareCall[1].body)).toEqual({ email: 'teacher@school.edu' });
    expect(screen.getByRole('button', { name: 'Saved' })).toBeDisabled();
  });
});

describe('review fixes', () => {
  /** Fill in and submit the sign-in dialog; signIn is mocked to succeed. */
  const signInThroughDialog = async (user) => {
    signIn.mockResolvedValue({ ok: true, error: null });
    const dialog = screen.getByRole('dialog', { name: 'Sign in' });
    await user.type(within(dialog).getByLabelText('Email address'), 'teacher@example.com');
    await user.type(within(dialog).getByLabelText('Password'), 'correct horse');
    await user.click(within(dialog).getByRole('button', { name: 'Sign in' }));
  };

  it('asks a signed-out grown-up to sign in before sharing, then opens the share form', async () => {
    useSession.mockReturnValue(signedOut);
    mockFetch({});
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);

    await user.click(screen.getByRole('button', { name: 'Try some words' }));
    await user.click(screen.getByRole('button', { name: 'Make my story' }));
    await readToTheEnd(user);
    await user.click(screen.getByRole('button', { name: 'Share' }));

    expect(screen.queryByRole('dialog', { name: 'Share this story' })).not.toBeInTheDocument();
    await signInThroughDialog(user);

    expect(await screen.findByRole('dialog', { name: 'Share this story' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Sign in' })).not.toBeInTheDocument();
  });

  it('saves the story once sign-in from Save succeeds', async () => {
    useSession.mockReturnValue(signedOut);
    mockFetch({ 'POST /api/stories': [201, savedStory] });
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);

    await user.click(screen.getByRole('button', { name: 'Try some words' }));
    await user.click(screen.getByRole('button', { name: 'Make my story' }));
    await readToTheEnd(user);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await signInThroughDialog(user);

    await waitFor(() => expect(fetchCalls('POST', '/api/stories')).toHaveLength(1));
    expect(await screen.findByRole('button', { name: 'Saved' })).toBeDisabled();
  });

  it('stops adding words at the story limit and says how many were left out', async () => {
    useSession.mockReturnValue(signedOut);
    mockFetch({});
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
    useSession.mockReturnValue(signedOut);
    mockFetch({});
    const user = userEvent.setup();
    const { unmount } = render(<SightWordStoryGenerator />);
    await user.click(screen.getByRole('button', { name: 'Try some words' }));
    await user.click(screen.getByRole('button', { name: 'Make my story' }));
    await user.click(await screen.findByRole('button', { name: 'Done' }));
    unmount();

    render(<SightWordStoryGenerator />);

    const cards = within(await screen.findByRole('list', { name: 'Your words' })).getAllByRole('listitem');
    expect(cards.map((card) => card.textContent)).toEqual(STARTER_WORDS);
    expect(screen.getByRole('heading', { name: 'Read again' })).toBeInTheDocument();
  });

  it('says when saved stories could not be loaded, and tries again', async () => {
    useSession.mockReturnValue(signedIn);
    mockFetch({ 'GET /api/stories': [500, { message: 'Internal server error' }] });
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);
    await openGrownUps(user);

    expect(await screen.findByText("Your saved stories couldn't be loaded.")).toBeInTheDocument();

    mockFetch({ 'GET /api/stories': [200, []] });
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('No saved stories yet. Save one from the last page of a story.')).toBeInTheDocument();
  });
});

describe('account deletion', () => {
  it('deletes the account after the password is entered, then signs out and forgets the key', async () => {
    useSession.mockReturnValue(signedIn);
    storeAnthropicKey('user-1', testKey);
    mockFetch({ 'GET /api/stories': [200, []], 'DELETE /api/account': [200, { success: true, storiesDeleted: 0 }] });
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);
    await openGrownUps(user);

    await user.click(screen.getByRole('button', { name: 'Delete account' }));
    const dialog = screen.getByRole('dialog', { name: 'Delete your account?' });
    await user.type(within(dialog).getByLabelText('Password'), 'correct horse');
    await user.click(within(dialog).getByRole('button', { name: 'Delete account' }));

    await waitFor(() => expect(signOut).toHaveBeenCalled());
    const [deleteCall] = fetchCalls('DELETE', '/api/account');
    expect(JSON.parse(deleteCall[1].body)).toEqual({ password: 'correct horse' });
    expect(loadAnthropicKey('user-1')).toBeNull();
    expect(screen.getByText('Your account and saved stories were deleted.')).toBeInTheDocument();
  });

  it('keeps the account and says why when the password is wrong', async () => {
    useSession.mockReturnValue(signedIn);
    mockFetch({ 'GET /api/stories': [200, []], 'DELETE /api/account': [403, { message: "That password isn't right." }] });
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);
    await openGrownUps(user);

    await user.click(screen.getByRole('button', { name: 'Delete account' }));
    const dialog = screen.getByRole('dialog', { name: 'Delete your account?' });
    await user.type(within(dialog).getByLabelText('Password'), 'wrong');
    await user.click(within(dialog).getByRole('button', { name: 'Delete account' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent("That password isn't right.");
    expect(signOut).not.toHaveBeenCalled();
  });
});
