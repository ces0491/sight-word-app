import {
  loadAnthropicKey,
  storeAnthropicKey,
  forgetAnthropicKey,
  cleanAnthropicKey,
  anthropicKeyHint,
} from '../anthropicKey';

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('saved keys', () => {
  it('keeps one key per account', () => {
    expect(storeAnthropicKey('user-1', 'key-one')).toBe(true);
    expect(loadAnthropicKey('user-1')).toBe('key-one');
    expect(loadAnthropicKey('user-2')).toBeNull();
  });

  it("forgets only that account's key", () => {
    storeAnthropicKey('user-1', 'key-one');
    storeAnthropicKey('user-2', 'key-two');
    forgetAnthropicKey('user-1');

    expect(loadAnthropicKey('user-1')).toBeNull();
    expect(loadAnthropicKey('user-2')).toBe('key-two');
  });

  it('stores nothing without an account', () => {
    expect(storeAnthropicKey(undefined, 'key')).toBe(false);
    expect(loadAnthropicKey(undefined)).toBeNull();
    expect(window.localStorage).toHaveLength(0);
  });

  it("reports when the browser won't keep the key", () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(storeAnthropicKey('user-1', 'key')).toBe(false);
  });

  it('reads nothing when storage is blocked', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(loadAnthropicKey('user-1')).toBeNull();
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
