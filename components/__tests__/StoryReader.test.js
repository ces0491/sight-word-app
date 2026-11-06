import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StoryReader from '../storybook/StoryReader';
import { installSpeechMock } from '../../test/speechMock';

const story = {
  title: 'A Day Out',
  content: ['The dog can run.', 'We see the park.', 'It was fun.'],
  words: ['the', 'can', 'see'],
  usedWords: ['the', 'can', 'see'],
  format: 'highlighted',
  includeImages: false,
};

describe('StoryReader', () => {
  it('shows one page at a time and turns pages with the buttons', async () => {
    render(<StoryReader story={story} onClose={() => {}} />);

    expect(screen.getByRole('article', { name: 'Page 1 of 3' })).toHaveTextContent('The dog can run.');
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('article', { name: 'Page 2 of 3' })).toHaveTextContent('We see the park.');
  });

  it('turns pages with the arrow keys', async () => {
    render(<StoryReader story={story} onClose={() => {}} />);

    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(screen.getByRole('article', { name: 'Page 3 of 3' })).toBeInTheDocument();

    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('article', { name: 'Page 2 of 3' })).toBeInTheDocument();
  });

  it('ends with "The end!", the word hunt and the grown-up actions', async () => {
    const onSave = jest.fn();
    render(<StoryReader story={story} onClose={() => {}} actions={{ onSave, onPrint: () => {} }} />);

    for (let i = 0; i < story.content.length; i++) {
      await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    }

    expect(screen.getByRole('heading', { name: 'The end!' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Word hunt' }));
    expect(screen.getByRole('group', { name: 'Word cards' })).toBeInTheDocument();
  });

  it('marks a saved story as saved', async () => {
    render(<StoryReader story={story} onClose={() => {}} actions={{ onSave: () => {}, isSaved: true }} />);
    for (let i = 0; i < story.content.length; i++) {
      await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    }

    expect(screen.getByRole('button', { name: 'Saved' })).toBeDisabled();
  });

  it('hides read-aloud where the browser cannot speak', () => {
    render(<StoryReader story={story} onClose={() => {}} />);

    expect(screen.queryByRole('button', { name: 'Read to me' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'dog' })).not.toBeInTheDocument();
  });

  describe('with speech', () => {
    let speech;
    beforeEach(() => {
      speech = installSpeechMock();
    });
    afterEach(() => {
      speech.uninstall();
    });

    it('reads the page aloud and lights up each word as it is spoken', async () => {
      const { container } = render(<StoryReader story={story} onClose={() => {}} />);

      await userEvent.click(screen.getByRole('button', { name: 'Read to me' }));
      expect(speech.spoken.at(-1).text).toBe('The dog can run.');
      expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument();

      act(() => speech.boundary(4));
      expect(container.querySelector('.is-spoken')).toHaveTextContent('dog');

      act(() => speech.finish());
      expect(screen.getByRole('button', { name: 'Read to me' })).toBeInTheDocument();
      expect(container.querySelector('.is-spoken')).toBeNull();
    });

    it('says a word when it is tapped', async () => {
      render(<StoryReader story={story} onClose={() => {}} />);

      await userEvent.click(screen.getByRole('button', { name: 'run' }));

      expect(speech.spoken.at(-1).text).toBe('run');
    });

    it('stops reading when the page turns', async () => {
      render(<StoryReader story={story} onClose={() => {}} />);
      await userEvent.click(screen.getByRole('button', { name: 'Read to me' }));
      speech.synth.cancel.mockClear();

      await userEvent.click(screen.getByRole('button', { name: 'Next' }));

      expect(speech.synth.cancel).toHaveBeenCalled();
    });
  });
});

describe('StoryReader, learning needs and focus', () => {
  it("reads the story with its own learning needs, and removes them when it closes", () => {
    const { unmount } = render(
      <StoryReader story={{ ...story, learningNeeds: { dyslexia: true, adhd: false } }} onClose={() => {}} />
    );

    expect(document.body).toHaveClass('dyslexia-enabled');
    expect(document.body).not.toHaveClass('adhd-enabled');

    unmount();
    expect(document.body).not.toHaveClass('dyslexia-enabled');
  });

  it('moves focus to "The end!" after the last page, where the Next button was', async () => {
    const user = userEvent.setup();
    render(<StoryReader story={story} onClose={() => {}} />);

    for (let i = 0; i < story.content.length; i++) {
      await user.click(screen.getByRole('button', { name: 'Next' }));
    }

    expect(screen.getByRole('heading', { name: 'The end!' })).toHaveFocus();
  });
});
