/**
 * Share links that carry the story itself, compressed into the part of the
 * link after "#". Browsers don't send that part to the server, so a shared
 * story never reaches this site: whoever opens the link reads it from the
 * link. Learning needs are left out, as they describe the child.
 *
 * Because the story is in the link, a link can't be switched off later.
 */

import { sharedStorySchema } from './validation';
import { findUsedWords } from './sightWords';

/** The page that opens share links. */
export const SHARED_STORY_PATH = '/shared-story';

/** Written before the data, so a later format can still read old links. */
const FORMAT_VERSION = '1';

/** A link this long wasn't made by the app. The longest story allowed makes a far shorter one. */
const MAX_DATA_LENGTH = 100_000;

/** Stop unpacking past this, so a crafted link can't make the browser expand a huge story. */
const MAX_UNPACKED_BYTES = 200_000;

/** Run bytes through a compression stream, giving up past `maxBytes` of output. */
async function transform(bytes, stream, maxBytes = Infinity) {
  const writer = stream.writable.getWriter();
  // Errors surface through the reader below; these would otherwise be unhandled rejections
  writer.write(bytes).catch(() => {});
  writer.close().catch(() => {});

  const reader = stream.readable.getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new Error('Share link data is too large');
    }
    chunks.push(value);
  }

  const output = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return output;
}

const toBase64Url = (bytes) => {
  let binary = '';
  // In slices, as spreading a long array into one call can overflow the stack
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (text) => {
  if (!/^[A-Za-z0-9_-]+$/.test(text)) throw new Error('Share link data is not base64url');
  const base64 = text.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

/**
 * A link that opens this story on another device.
 * @param {object} story - A story from the reader or the library
 * @param {string} origin - This site, e.g. window.location.origin
 * @returns {Promise<string>}
 * @throws When the story isn't one the app could have made
 */
export async function makeShareLink(story, origin) {
  const shared = sharedStorySchema.parse(story);
  const packed = await transform(new TextEncoder().encode(JSON.stringify(shared)), new CompressionStream('deflate-raw'));
  return `${origin}${SHARED_STORY_PATH}#${FORMAT_VERSION}.${toBase64Url(packed)}`;
}

/**
 * The story in a share link's fragment, or null if the link is damaged,
 * from an unknown format, or holds something that isn't a story.
 * @param {string} hash - window.location.hash
 * @returns {Promise<object | null>}
 */
export async function readShareLink(hash) {
  const fragment = String(hash ?? '').replace(/^#/, '');
  const dot = fragment.indexOf('.');
  if (dot === -1 || fragment.slice(0, dot) !== FORMAT_VERSION) return null;
  const data = fragment.slice(dot + 1);
  if (!data || data.length > MAX_DATA_LENGTH) return null;

  try {
    const unpacked = await transform(fromBase64Url(data), new DecompressionStream('deflate-raw'), MAX_UNPACKED_BYTES);
    const parsed = sharedStorySchema.safeParse(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(unpacked)));
    if (!parsed.success) return null;
    return { ...parsed.data, usedWords: findUsedWords(parsed.data.content, parsed.data.words) };
  } catch {
    return null;
  }
}
