import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSession } from 'next-auth/react';
import SightWordStoryGenerator from '../SightWordStoryGenerator';
import { answerGate } from '../../test/gateHelpers';
import { STARTER_WORDS } from '../../lib/wordLists';

jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signIn: jest.fn(), signOut: jest.fn() }));
// OCR pulls in tesseract.js, which isn't needed here
jest.mock('../ImageUpload', () => () => null);
// The usage dashboard fetches on mount; it has its own concerns
jest.mock('../analytics/WordUsageDashboard', () => () => null);

const signedIn = { data: { user: { id: 'user-1', name: 'Ms Smith' } }, status: 'authenticated' };
const signedOut = { data: null, status: 'unauthenticated' };

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
    expect(fetchCalls('POST', '/api/stories/generate-ai')).toHaveLength(0);
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
});

describe('AI stories', () => {
  const chooseAi = async (user) => {
    await openGrownUps(user);
    await user.click(screen.getByRole('button', { name: 'AI' }));
    await user.click(screen.getByRole('button', { name: 'Back to story time' }));
    await user.click(screen.getByRole('button', { name: 'Try some words' }));
    await user.click(screen.getByRole('button', { name: 'Make my story' }));
  };

  it('reads the AI story when the route succeeds', async () => {
    useSession.mockReturnValue(signedIn);
    mockFetch({ 'GET /api/stories': [200, []], 'POST /api/stories/generate-ai': [200, aiStory] });
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);

    await chooseAi(user);

    expect(await screen.findByRole('article', { name: 'Page 1 of 1' })).toHaveTextContent('The dog can run.');
    expect(screen.getAllByText('The AI Dog').length).toBeGreaterThan(0);
  });

  it('falls back to Classic and shows the server message when AI fails', async () => {
    useSession.mockReturnValue(signedIn);
    mockFetch({
      'GET /api/stories': [200, []],
      'POST /api/stories/generate-ai': [429, { message: 'Too many requests. Please try again later.' }],
    });
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);

    await chooseAi(user);

    expect(await screen.findByText('Too many requests. Please try again later. Using Classic mode instead.')).toBeInTheDocument();
    expect(screen.getByRole('article', { name: /Page 1 of/ })).toBeInTheDocument();
  });

  it('saves an unsaved story before sharing it by its database id', async () => {
    useSession.mockReturnValue(signedIn);
    mockFetch({
      'GET /api/stories': [200, []],
      'POST /api/stories/generate-ai': [200, aiStory],
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
