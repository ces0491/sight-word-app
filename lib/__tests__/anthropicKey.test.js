import {
  loadAnthropicKey,
  storeAnthropicKey,
  forgetAnthropicKey,
  forgetAccountKeys,
  cleanAnthropicKey,
  anthropicKeyHint,
} from '../anthropicKey';

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('saved key', () => {
  it('keeps the key until it is removed', () => {
    expect(storeAnthropicKey('key-one')).toBe(true);
    expect(loadAnthropicKey()).toBe('key-one');

    forgetAnthropicKey();
    expect(loadAnthropicKey()).toBeNull();
  });

  it("reports when the browser won't keep the key", () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(storeAnthropicKey('key')).toBe(false);
  });

  it('reads nothing when storage is blocked', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(loadAnthropicKey()).toBeNull();
  });
});

describe('forgetAccountKeys', () => {
  it('removes keys saved under an account, and nothing else', () => {
    window.localStorage.setItem('sightwords:anthropic-key:user-1', 'old-one');
    window.localStorage.setItem('sightwords:anthropic-key:user-2', 'old-two');
    window.localStorage.setItem('sightwords:library', '[]');
    storeAnthropicKey('current');

    forgetAccountKeys();

    expect(Object.keys(window.localStorage).sort()).toEqual(['sightwords:anthropic-key', 'sightwords:library']);
    expect(loadAnthropicKey()).toBe('current');
  });
});

describe('cleanAnthropicKey', () => {
  it.each([
    ['  key-with-spaces-around  ', 'key-with-spaces-around'],
    ['', null],
    ['   ', null],
    ['two parts', null],
    [undefined, null],
  ])('cleans %p to %p', (input, expected) => {
    expect(cleanAnthropicKey(input)).toBe(expected);
  });
});

it('hints with the last four characters', () => {
  expect(anthropicKeyHint('abcdefgh1234')).toBe('1234');
});
