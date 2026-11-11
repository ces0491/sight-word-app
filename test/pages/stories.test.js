import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import StoriesPage from '../../pages/stories';
import StoryPage from '../../pages/stories/[id]';
import EditStoryPage from '../../pages/stories/[id]/edit';
import NewStoryPage from '../../pages/stories/new';
import { addStory, findSavedStory, getSavedStories } from '../../lib/storyLibrary';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

const push = jest.fn();
const routeTo = (query = {}) => useRouter.mockReturnValue({ push, query, isReady: true });

const fields = { title: 'The Dog Can Run', content: ['The dog can run.'], words: ['the', 'can'], grade: 1 };

beforeEach(() => {
  window.localStorage.clear();
  push.mockReset();
  routeTo();
});

describe('Story library', () => {
  it('lists the stories saved in this browser', () => {
    addStory(fields);
    addStory({ ...fields, title: 'A Cat Day' });
    render(<StoriesPage />);

    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(['A Cat Day', 'The Dog Can Run']);
  });

  it('says where stories come from when there are none', () => {
    render(<StoriesPage />);
    expect(screen.getByText(/Stories are saved in this browser\./)).toBeInTheDocument();
  });

  it('deletes a story after asking', async () => {
    addStory(fields);
    const user = userEvent.setup();
    render(<StoriesPage />);

    await user.click(screen.getByRole('button', { name: 'Delete The Dog Can Run' }));
    const dialog = screen.getByRole('dialog', { name: 'Delete this story?' });
    expect(within(dialog).getByText(/Links you.ve shared keep working/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(getSavedStories()).toEqual([]);
    expect(screen.getByRole('heading', { name: 'No saved stories yet' })).toBeInTheDocument();
  });
});

describe('Saved story page', () => {
  it('opens the saved story', () => {
    const { story } = addStory(fields);
    routeTo({ id: story.id });
    render(<StoryPage />);

    expect(screen.getByRole('article', { name: 'Page 1 of 1' })).toHaveTextContent('The dog can run.');
  });

  it("says when the story isn't saved in this browser", () => {
    routeTo({ id: 'somewhere-else' });
    render(<StoryPage />);

    expect(screen.getByText("It isn't saved in this browser.")).toBeInTheDocument();
  });
});

describe('Editing and writing stories', () => {
  it('saves changes to the story and goes back to it', async () => {
    const { story } = addStory(fields);
    routeTo({ id: story.id });
    const user = userEvent.setup();
    render(<EditStoryPage />);

    await user.clear(screen.getByLabelText('Title'));
    await user.type(screen.getByLabelText('Title'), 'The Dog Can Jump');
    await user.click(screen.getByRole('button', { name: 'Save story' }));

    expect(findSavedStory(story.id).title).toBe('The Dog Can Jump');
    expect(push).toHaveBeenCalledWith(`/stories/${story.id}`);
  });

  it('saves a new story and opens it', async () => {
    const user = userEvent.setup();
    render(<NewStoryPage />);

    await user.type(screen.getByLabelText('Title'), 'My Own Story');
    await user.click(screen.getByRole('button', { name: /Add sentence/ }));
    await user.type(screen.getByLabelText('Sentence 1'), 'I can see.');
    await user.type(screen.getByLabelText(/Words to add/), 'see{Enter}');
    await user.click(screen.getByRole('button', { name: 'Save story' }));

    const [saved] = getSavedStories();
    expect(saved).toMatchObject({ title: 'My Own Story', content: ['I can see.'], words: ['see'] });
    expect(push).toHaveBeenCalledWith(`/stories/${saved.id}`);
  });
});
