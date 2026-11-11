import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SharedStoryPage from '../../pages/shared-story';
import { makeShareLink } from '../../lib/shareLink';
import { getSavedStories } from '../../lib/storyLibrary';

jest.mock('next/router', () => ({ useRouter: () => ({ push: jest.fn() }) }));

const story = {
  title: 'The Dog Can Run',
  content: ['The dog can run.'],
  words: ['the', 'can'],
  grade: 1,
  learningNeeds: { dyslexia: true },
};

/** Point this page's address at a share link for the story. */
const openLink = async (shared) => {
  const link = await makeShareLink(shared, window.location.origin);
  window.history.replaceState(null, '', new URL(link).pathname + new URL(link).hash);
};

beforeEach(() => {
  window.localStorage.clear();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  window.history.replaceState(null, '', '/');
});

describe('Shared story page', () => {
  it('opens the story held in the link', async () => {
    await openLink(story);
    render(<SharedStoryPage />);

    expect(await screen.findByRole('article', { name: 'Page 1 of 1' })).toHaveTextContent('The dog can run.');
  });

  it('says the link is damaged when it holds no story', async () => {
    window.history.replaceState(null, '', '/shared-story#1.not-a-story');
    render(<SharedStoryPage />);

    expect(await screen.findByText('The link is damaged or incomplete. Ask for it again, and copy all of it.')).toBeInTheDocument();
  });

  it('saves a copy in this browser, without learning needs', async () => {
    await openLink(story);
    const user = userEvent.setup();
    render(<SharedStoryPage />);
    await screen.findByRole('article', { name: 'Page 1 of 1' });

    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByRole('button', { name: 'Saved' })).toBeDisabled();
    const [saved] = getSavedStories();
    expect(saved).toMatchObject({ title: 'The Dog Can Run', learningNeeds: {} });
  });

  it('opens a new link pasted into the same tab', async () => {
    await openLink(story);
    render(<SharedStoryPage />);
    expect(await screen.findByRole('article', { name: 'Page 1 of 1' })).toHaveTextContent('The dog can run.');

    await openLink({ ...story, content: ['I see a cat.'] });
    act(() => {
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    await waitFor(() => expect(screen.getByRole('article', { name: 'Page 1 of 1' })).toHaveTextContent('I see a cat.'));
  });
});
