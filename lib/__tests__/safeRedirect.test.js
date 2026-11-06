import { safeCallbackPath } from '../safeRedirect';

const ORIGIN = 'https://sightwords.example';

describe('safeCallbackPath', () => {
  it.each([
    ['/stories', '/stories'],
    ['/stories?sort=title#top', '/stories?sort=title#top'],
    ['/stories/../auth/signin', '/auth/signin'],
  ])('keeps the page on this site: %p', (url, expected) => {
    expect(safeCallbackPath(url, ORIGIN)).toBe(expected);
  });

  it.each([
    ['another site', 'https://evil.example/'],
    ['a protocol-relative URL', '//evil.example'],
    ['a tab hidden in the slashes', '/\t/evil.example'],
    ['a newline hidden in the slashes', '/\n/evil.example'],
    ['a backslash', '/\\evil.example'],
    ['a javascript: URL', 'javascript:alert(1)'],
    ['a list of values', ['/stories']],
    ['nothing', undefined],
  ])('sends %s to the home page', (_, url) => {
    expect(safeCallbackPath(url, ORIGIN)).toBe('/');
  });
});
