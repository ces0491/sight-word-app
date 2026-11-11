import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StoryEditor from '../story/StoryEditor';

const story = {
  title: 'A Day Out',
  content: ['We went out.'],
  words: ['we'],
  format: 'highlighted',
  includeImages: true,
  grade: 1,
  learningNeeds: { adhd: true },
};

afterEach(() => {
  jest.restoreAllMocks();
});

describe('StoryEditor', () => {
  it('saves a tidied story with all five learning needs', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn().mockResolvedValue(undefined);
    render(<StoryEditor story={story} onSave={onSave} onCancel={() => {}} />);

    await user.click(screen.getByRole('button', { name: '+ Add sentence' }));
    await user.click(screen.getByRole('button', { name: 'Save story' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'A Day Out',
        content: ['We went out.'],
        learningNeeds: { adhd: true, dyslexia: false, autism: false, esl: false, visualProcessing: false },
      })
    );
  });

  it('explains what stops a save instead of sending it', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    render(<StoryEditor story={story} onSave={onSave} onCancel={() => {}} />);

    await user.clear(screen.getByLabelText('Title'));
    await user.click(screen.getByRole('button', { name: 'Save story' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Give the story a title.');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('shows why saving failed', async () => {
    const user = userEvent.setup();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const onSave = jest.fn().mockRejectedValue(new Error('This browser has no room for more stories. Delete some from the story library, then try again.'));
    render(<StoryEditor story={story} onSave={onSave} onCancel={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'Save story' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('This browser has no room for more stories.');
  });

  it('names its icon buttons and cleans added words', async () => {
    const user = userEvent.setup();
    render(<StoryEditor story={story} onSave={jest.fn()} onCancel={() => {}} />);

    await user.type(screen.getByLabelText(/Words to add/), 'See, don’t{Enter}');

    expect(screen.getByRole('button', { name: 'Remove see' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "Remove don't" })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove sentence 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to the library' })).toBeInTheDocument();
  });

  it('asks before leaving with unsaved changes', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    const confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
    render(<StoryEditor story={story} onSave={jest.fn()} onCancel={onCancel} />);

    await user.type(screen.getByLabelText('Title'), '!');
    await user.click(screen.getByRole('button', { name: 'Back to the library' }));

    expect(confirm).toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('leaves without asking when nothing changed', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    const confirm = jest.spyOn(window, 'confirm');
    render(<StoryEditor story={story} onSave={jest.fn()} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: 'Back to the library' }));

    expect(confirm).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
  });
});
