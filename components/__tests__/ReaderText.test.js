import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReaderText, { tokenizeSentence } from '../storybook/ReaderText';

describe('tokenizeSentence', () => {
  it('keeps positions and strips punctuation from the spoken word', () => {
    const tokens = tokenizeSentence('"Look," said Max.');
    const words = tokens.filter((t) => t.isWord);

    expect(words.map((t) => t.core)).toEqual(['Look', 'said', 'Max']);
    expect(words[1]).toMatchObject({ text: 'said', start: 8, end: 12 });
  });

  it('keeps apostrophes inside words', () => {
    expect(tokenizeSentence("I can't stop.").filter((t) => t.isWord).map((t) => t.core)).toEqual(['I', "can't", 'stop']);
  });
});

describe('ReaderText', () => {
  it('marks sight words, ignoring case', () => {
    const { container } = render(<ReaderText sentence="The dog can run." words={['the', 'can']} format="highlighted" />);
    const marked = [...container.querySelectorAll('.is-sight')].map((el) => el.textContent);

    expect(marked).toEqual(['The', 'can']);
  });

  it('says the tapped word without its punctuation', async () => {
    const onWordTap = jest.fn();
    render(<ReaderText sentence="Run, Max!" words={[]} onWordTap={onWordTap} />);

    await userEvent.click(screen.getByRole('button', { name: 'Max!' }));

    expect(onWordTap).toHaveBeenCalledWith('Max');
  });

  it('lights up the word being read aloud', () => {
    const { container } = render(<ReaderText sentence="The dog ran." words={[]} spokenIndex={4} />);

    expect(container.querySelector('.is-spoken').textContent).toBe('dog');
  });

  it('shows story text as text, not markup', () => {
    const payload = '<img src=x onerror="window.__xss = true"> the end';
    const { container } = render(<ReaderText sentence={payload} words={['the']} onWordTap={() => {}} />);

    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toBe(payload);
  });
});
