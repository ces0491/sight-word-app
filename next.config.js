const tesseract = require('tesseract.js/package.json');

/**
 * Where the photo scanner's OCR engine loads from. Tesseract builds its
 * default CDN URLs from the same package versions (worker in
 * src/worker/browser/defaultOptions.js, core in
 * src/worker-script/browser/getCore.js), so these follow an upgrade.
 * Only these paths are allowed: jsDelivr serves any npm package.
 */
const TESSERACT_WORKER = `https://cdn.jsdelivr.net/npm/tesseract.js@v${tesseract.version}/dist/worker.min.js`;
const TESSERACT_CORE = `https://cdn.jsdelivr.net/npm/tesseract.js-core@v${tesseract.dependencies['tesseract.js-core'].substring(1)}/`;
const TESSERACT_LANGUAGE_DATA = 'https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/';

/** AI stories call Anthropic from the browser with the grown-up's own key (lib/aiStory.js). */
const ANTHROPIC_API = 'https://api.anthropic.com';

const isDev = process.env.NODE_ENV === 'development';

/**
 * Content-Security-Policy. Scripts run only from this site and the OCR
 * engine, and the page can only send requests to this site, Anthropic and
 * the OCR language data, so an injected script could neither run nor send a
 * saved Anthropic API key anywhere else.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  // 'wasm-unsafe-eval' lets the OCR engine compile its WebAssembly; the dev server also needs eval
  `script-src 'self' 'wasm-unsafe-eval' ${TESSERACT_WORKER} ${TESSERACT_CORE}${isDev ? " 'unsafe-eval'" : ''}`,
  // Tesseract starts its worker from a blob: URL
  "worker-src 'self' blob:",
  `connect-src 'self' ${ANTHROPIC_API} ${TESSERACT_LANGUAGE_DATA}`,
  // Server-rendered markup carries style attributes (next/image among others)
  "style-src 'self' 'unsafe-inline'",
  // Scanned photos are previewed from blob: URLs
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // For browsers that predate frame-ancestors
  { key: 'X-Frame-Options', value: 'DENY' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

module.exports = nextConfig;
