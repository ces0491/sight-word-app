import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSession } from 'next-auth/react';
import SightWordStoryGenerator from '../SightWordStoryGenerator';

jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signIn: jest.fn() }));
// OCR pulls in tesseract.js, which isn't needed here
jest.mock('../ImageUpload', () => () => null);

const signedIn = { data: { user: { id: 'user-1', name: 'Ms Smith' } }, status: 'authenticated' };
const signedOut = { data: null, status: 'unauthenticated' };

const aiStory = { title: 'The AI Dog', content: ['The dog can run.'], usedWords: ['the', 'dog'] };
const savedStory = {
  _id: '64b0c0ffee0000000000abcd',
  title: 'The AI Dog',
  content: ['The dog can run.'],
  words: ['the', 'dog'],
  usedWords: ['the', 'dog'],
  format: 'highlighted',
  includeImages: false,
  grade: 1,
  learningNeeds: {},
  createdAt: '2026-01-01T00:00:00.000Z',
};

const jsonResponse = (status, body) => Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });

/** Route fetch calls by method and path; anything unlisted returns 200 {}. */
const mockFetch = (routes) => {
  global.fetch = jest.fn((url, options = {}) => {
    const key = `${options.method || 'GET'} ${url}`;
    const route = routes[key];
    return route ? jsonResponse(...route) : jsonResponse(200, {});
  });
};

const fetchCalls = (method, url) =>
  global.fetch.mock.calls.filter(([u, o = {}]) => u === url && (o.method || 'GET') === method);

const addWordsAndGenerate = async (user, text = 'the dog') => {
  await user.type(screen.getByPlaceholderText('e.g., cat dog house'), text);
  await user.click(screen.getByRole('button', { name: 'Add' }));
  await user.click(screen.getByRole('button', { name: 'Generate story with current words' }));
};

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  delete global.fetch;
});

describe('SightWordStoryGenerator', () => {
  it('disables AI mode for signed-out users', () => {
    useSession.mockReturnValue(signedOut);
    mockFetch({});
    render(<SightWordStoryGenerator />);

    expect(screen.getByRole('button', { name: 'AI' })).toBeDisabled();
    expect(screen.getByText('Sign in to use AI stories')).toBeInTheDocument();
  });

  it('cleans punctuation from typed words', async () => {
    useSession.mockReturnValue(signedOut);
    mockFetch({});
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);

    await user.type(screen.getByPlaceholderText('e.g., cat dog house'), 'Dog. cat! "see"');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByText('Current Words (3)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove word dog' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove word cat' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove word see' })).toBeInTheDocument();
  });

  it('generates a Classic story without calling the server', async () => {
    useSession.mockReturnValue(signedOut);
    mockFetch({});
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);

    await addWordsAndGenerate(user);

    expect(await screen.findByText('Sight Words Used:')).toBeInTheDocument();
    expect(fetchCalls('POST', '/api/stories/generate-ai')).toHaveLength(0);
  });

  it('uses the AI story when the route succeeds', async () => {
    useSession.mockReturnValue(signedIn);
    mockFetch({ 'GET /api/stories': [200, []], 'POST /api/stories/generate-ai': [200, aiStory] });
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);

    await user.click(screen.getByRole('button', { name: 'AI' }));
    await addWordsAndGenerate(user);

    expect(await screen.findByRole('heading', { name: 'The AI Dog' })).toBeInTheDocument();
  });

  it('falls back to Classic and shows the server message when AI fails', async () => {
    useSession.mockReturnValue(signedIn);
    mockFetch({
      'GET /api/stories': [200, []],
      'POST /api/stories/generate-ai': [429, { message: 'Too many requests. Please try again later.' }],
    });
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);

    await user.click(screen.getByRole('button', { name: 'AI' }));
    await addWordsAndGenerate(user);

    expect(
      await screen.findByText('Too many requests. Please try again later. Using Classic mode instead.')
    ).toBeInTheDocument();
    expect(screen.getByText('Sight Words Used:')).toBeInTheDocument();
  });

  it('saves an unsaved story before sharing and shares it by its database id', async () => {
    useSession.mockReturnValue(signedIn);
    mockFetch({
      'GET /api/stories': [200, []],
      'POST /api/stories/generate-ai': [200, aiStory],
      'POST /api/stories': [201, savedStory],
      [`POST /api/stories/${savedStory._id}/share`]: [200, { success: true }],
    });
    const user = userEvent.setup();
    render(<SightWordStoryGenerator />);

    await user.click(screen.getByRole('button', { name: 'AI' }));
    await addWordsAndGenerate(user);
    await screen.findByRole('heading', { name: 'The AI Dog' });

    await user.click(screen.getByRole('button', { name: 'Share' }));
    await user.type(screen.getByPlaceholderText('example@school.edu'), 'teacher@school.edu');
    const shareButtons = screen.getAllByRole('button', { name: 'Share' });
    await user.click(shareButtons[shareButtons.length - 1]);

    await waitFor(() => expect(fetchCalls('POST', `/api/stories/${savedStory._id}/share`)).toHaveLength(1));

    const [saveCall] = fetchCalls('POST', '/api/stories');
    const savedBody = JSON.parse(saveCall[1].body);
    expect(Object.keys(savedBody).sort()).toEqual(
      ['content', 'format', 'grade', 'includeImages', 'learningNeeds', 'scenes', 'title', 'words'].sort()
    );
    const [shareCall] = fetchCalls('POST', `/api/stories/${savedStory._id}/share`);
    expect(JSON.parse(shareCall[1].body)).toEqual({ email: 'teacher@school.edu' });
  });
});
