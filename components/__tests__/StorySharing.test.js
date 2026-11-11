import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StorySharing from '../story/StorySharing';
import { readShareLink } from '../../lib/shareLink';

const story = {
  title: 'The Dog Can Run',
  content: ['The dog can run.'],
  scenes: [],
  words: ['the', 'can'],
  format: 'highlighted',
  includeImages: true,
  grade: 1,
  learningNeeds: { dyslexia: true },
};

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('StorySharing', () => {
  it('shows a link on this site that opens the story, with focus on it', async () => {
    render(<StorySharing story={story} onClose={() => {}} />);

    const field = await screen.findByLabelText('Link to the story');
    expect(field).toHaveFocus();
    const link = new URL(field.value);
    expect(link.origin).toBe(window.location.origin);
    expect(link.pathname).toBe('/shared-story');
    expect(await readShareLink(link.hash)).toMatchObject({ title: 'The Dog Can Run', content: ['The dog can run.'] });
  });

  it('says the link holds the story and leaves out learning needs', () => {
    render(<StorySharing story={story} onClose={() => {}} />);
    expect(screen.getByText(/can.t be switched off later\. Learning needs aren.t included\./)).toBeInTheDocument();
  });

  it('copies the link and says so', async () => {
    const user = userEvent.setup();
    render(<StorySharing story={story} onClose={() => {}} />);

    const field = await screen.findByLabelText('Link to the story');
    await user.click(screen.getByRole('button', { name: 'Copy link' }));

    expect(await navigator.clipboard.readText()).toBe(field.value);
    expect(screen.getByRole('status')).toHaveTextContent('Link copied.');
  });

  it('asks for the link to be copied by hand when the clipboard refuses', async () => {
    const user = userEvent.setup();
    jest.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Not allowed'));
    render(<StorySharing story={story} onClose={() => {}} />);

    await user.click(await screen.findByRole('button', { name: 'Copy link' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('The link could not be copied. Select it and copy it instead.');
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it("says so when the story can't go in a link", async () => {
    render(<StorySharing story={{ ...story, content: [] }} onClose={() => {}} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('A link could not be made for this story.');
    expect(screen.queryByLabelText('Link to the story')).not.toBeInTheDocument();
  });
});
