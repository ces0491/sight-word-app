/** @jest-environment node */
const nextConfig = require('../../next.config');

const headersFor = async () => {
  const rules = await nextConfig.headers();
  expect(rules).toHaveLength(1);
  expect(rules[0].source).toBe('/:path*');
  return Object.fromEntries(rules[0].headers.map(({ key, value }) => [key, value]));
};

/** The policy as { directive: [sources] }. */
const parseCsp = (policy) =>
  Object.fromEntries(
    policy.split(';').map((part) => {
      const [directive, ...sources] = part.trim().split(/\s+/);
      return [directive, sources];
    })
  );

describe('security headers', () => {
  it('sets the standard hardening headers on every path', async () => {
    const headers = await headersFor();
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['X-Frame-Options']).toBe('DENY');
  });

  describe('Content-Security-Policy', () => {
    let csp;
    beforeAll(async () => {
      csp = parseCsp((await headersFor())['Content-Security-Policy']);
    });

    it('runs no inline or eval-ed script outside development', () => {
      expect(csp['script-src']).not.toContain("'unsafe-inline'");
      expect(csp['script-src']).not.toContain("'unsafe-eval'");
    });

    it('lets the page talk only to this site, Anthropic and the OCR language data', () => {
      expect(csp['connect-src']).toEqual([
        "'self'",
        'https://api.anthropic.com',
        'https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/',
      ]);
    });

    it('allows jsDelivr only on the paths of the installed Tesseract version', () => {
      const { version, dependencies } = require('tesseract.js/package.json');
      const jsDelivrSources = Object.values(csp).flat().filter((source) => source.includes('jsdelivr'));

      expect(jsDelivrSources).not.toContain('https://cdn.jsdelivr.net');
      expect(csp['script-src']).toEqual(
        expect.arrayContaining([
          `https://cdn.jsdelivr.net/npm/tesseract.js@v${version}/dist/worker.min.js`,
          `https://cdn.jsdelivr.net/npm/tesseract.js-core@v${dependencies['tesseract.js-core'].replace('^', '')}/`,
        ])
      );
    });

    it('blocks plugins, framing and form posts to other sites', () => {
      expect(csp['object-src']).toEqual(["'none'"]);
      expect(csp['frame-ancestors']).toEqual(["'none'"]);
      expect(csp['form-action']).toEqual(["'self'"]);
      expect(csp['base-uri']).toEqual(["'self'"]);
    });
  });
});
