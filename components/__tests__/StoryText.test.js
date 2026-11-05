import React from 'react';
import { render } from '@testing-library/react';
import StoryText from '../story/StoryText';

describe('StoryText', () => {
  it('renders HTML in story content as text, not markup', () => {
    const payload = '<img src=x onerror="window.__xss = true"> the end';
    const { container } = render(<StoryText sentence={payload} words={['the']} format="highlighted" />);

    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toBe(payload);
    expect(window.__xss).toBeUndefined();
  });

  it.each([
    ['highlighted', 'span.highlight'],
    ['bold', 'strong'],
    ['underlined', 'u'],
  ])('marks sight words in %s format', (format, selector) => {
    const { container } = render(<StoryText sentence="The cat sat." words={['cat']} format={format} />);
    const marked = container.querySelectorAll(selector);

    expect(marked).toHaveLength(1);
    expect(marked[0].textContent).toBe('cat');
  });

  it('renders plain text in normal format', () => {
    const { container } = render(<StoryText sentence="The cat sat." words={['cat']} format="normal" />);

    expect(container.innerHTML).toBe('The cat sat.');
  });

  it('does not break on words that contain regex characters', () => {
    const { container } = render(<StoryText sentence="Look (here)" words={['a)', '(']} format="highlighted" />);

    expect(container.textContent).toBe('Look (here)');
  });
});
