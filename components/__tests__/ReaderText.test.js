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

  it('leaves quotes outside the words and keeps every character', () => {
    const sentence = `'Come here,' said Mum.`;
    const tokens = tokenizeSentence(sentence);

    expect(tokens.filter((t) => t.isWord).map((t) => t.core)).toEqual(['Come', 'here', 'said', 'Mum']);
    expect(tokens.map((t) => t.text).join('')).toBe(sentence);
  });
});

describe('ReaderText', () => {
  it('marks sight words, ignoring case', () => {
    const { container } = render(<ReaderText sentence="The dog can run." words={['the', 'can']} format="highlighted" />);
    const marked = [...container.querySelectorAll('.is-sight')].map((el) => el.textContent);

    expect(marked).toEqual(['The', 'can']);
  });

  it('makes each word a button, leaving punctuation outside it', async () => {
    const onWordTap = jest.fn();
    const { container } = render(<ReaderText sentence="Run, Max!" words={[]} onWordTap={onWordTap} />);

    await userEvent.click(screen.getByRole('button', { name: 'Max' }));

    expect(onWordTap).toHaveBeenCalledWith('Max');
    expect(container.textContent).toBe('Run, Max!');
  });

  it('marks the same words that are counted as used', () => {
    const sentence = `"Come here," said Mum. I can't stop. It's well-known.`;
    const { container } = render(<ReaderText sentence={sentence} words={['come', 'here', 'can', 'it', 'well']} />);
    const marked = [...container.querySelectorAll('.is-sight')].map((el) => el.textContent);

    // "can" inside "can't", "it" inside "it's" and "well" inside "well-known" are different words
    expect(marked).toEqual(['Come', 'here']);
  });

  it('marks a sight word written with a curly apostrophe', () => {
    const { container } = render(<ReaderText sentence="Don’t go." words={["don't"]} />);
    expect(container.querySelector('.is-sight').textContent).toBe('Don’t');
  });

  it('lights the next word when speech reports a position on punctuation', () => {
    const { container } = render(<ReaderText sentence={'"Look," said Max.'} words={[]} spokenIndex={0} />);
    expect(container.querySelector('.is-spoken').textContent).toBe('Look');
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
