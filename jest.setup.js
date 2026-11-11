// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom leaves out web APIs that the supported browsers and Node both have.
// Share links (lib/shareLink.js) use these, so tests take Node's.
const { TextEncoder, TextDecoder } = require('node:util');
const { CompressionStream, DecompressionStream } = require('node:stream/web');

for (const [name, value] of Object.entries({ TextEncoder, TextDecoder, CompressionStream, DecompressionStream })) {
  if (typeof globalThis[name] === 'undefined') globalThis[name] = value;
}
