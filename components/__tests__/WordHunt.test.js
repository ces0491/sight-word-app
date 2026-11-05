import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WordHunt, { buildRounds } from '../storybook/WordHunt';

const silent = { supported: false, speak: jest.fn() };

describe('buildRounds', () => {
  it('makes up to five rounds from the story words', () => {
    const rounds = buildRounds(['the', 'dog', 'can', 'run', 'see', 'go', 'my']);

    expect(rounds).toHaveLength(5);
    rounds.forEach((round) => {
      expect(round.choices).toHaveLength(3);
      expect(round.choices).toContain(round.target);
      expect(new Set(round.choices).size).toBe(3);
    });
    expect(new Set(rounds.map((r) => r.target)).size).toBe(5);
  });

  it('tops up the choices when a story has only one word', () => {
    const [round] = buildRounds(['the']);
    expect(round.choices).toHaveLength(3);
    expect(round.choices).toContain('the');
  });
});

describe('WordHunt', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  const user = () => userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  it('shows the word to find when the device cannot speak', () => {
    render(<WordHunt words={['the']} speech={silent} onDone={() => {}} />);

    expect(screen.getByRole('heading', { name: 'Find this word' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Show me' })).not.toBeInTheDocument();
  });

  it('greys out a wrong card and moves on after the right one', async () => {
    render(<WordHunt words={['the']} speech={silent} onDone={() => {}} />);
    const cards = screen.getByRole('group', { name: 'Word cards' });
    const wrong = [...cards.querySelectorAll('button')].find((b) => b.textContent !== 'the');

    await user().click(wrong);
    expect(wrong.className).toContain('opacity-40');

    const right = [...cards.querySelectorAll('button')].find((b) => b.textContent === 'the');
    await user().click(right);
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByRole('heading', { name: 'You found them all!' })).toBeInTheDocument();
  });

  it('says the word and offers a hint when the device can speak', async () => {
    const speech = { supported: true, speak: jest.fn() };
    render(<WordHunt words={['see']} speech={speech} onDone={() => {}} />);

    expect(speech.speak).toHaveBeenCalledWith('see');
    expect(screen.getByRole('heading', { name: 'Find the word you hear' })).toBeInTheDocument();

    await user().click(screen.getByRole('button', { name: 'Show me' }));
    expect(screen.queryByRole('button', { name: 'Show me' })).not.toBeInTheDocument();
  });
});
