# Security Policy

## Supported Versions

| Version | Supported |
| --- | --- |
| `main` | Yes |
| Earlier versions, which had accounts and a server | No |

## Reporting a Vulnerability

Please don't report security problems in public GitHub issues.

### How to Report

Use GitHub's private vulnerability reporting: [report a vulnerability](https://github.com/ces0491/sight-word-app/security/advisories/new), or go to the repository's **Security** tab and click **Report a vulnerability**. Only the maintainer sees the report.

### What to Include

- **Type of vulnerability** (e.g., XSS, a share link that breaks the reader)
- **Location** (file path, URL, or component)
- **Steps to reproduce** the issue
- **Potential impact**
- **Suggested fix**, if you have one

### Example Report

```text
Subject: [SECURITY] Script runs from a share link

Steps to Reproduce:
1. Make a share link for a story titled <img src=x onerror=alert(1)>
2. Open the link

Impact:
Code from a link would run in the reader's browser, where it could read
their saved stories and Anthropic API key.

Suggested Fix:
Render the title as text.
```

## Response and Disclosure

The maintainer aims to reply within a few days. How soon a fix ships depends on severity.

Reports are confirmed, checked and fixed, and the fix is released before anything is made public. Please don't disclose the problem until then. Reporters are credited in the security advisory unless they'd rather not be.

## Security Best Practices

### For Administrators

- Update dependencies regularly, and watch the repository on GitHub for security advisories
- Turn on two-factor authentication for the GitHub and Vercel accounts: whoever controls either can change what the site serves

### For Developers

1. **Code**
   - Render user text as React text, never as HTML
   - Treat anything read from browser storage or a share link as untrusted: parse it with the schemas in [`lib/validation.js`](lib/validation.js)
   - A new outside service the browser talks to needs adding to the Content-Security-Policy and naming on the privacy page

2. **Dependencies**
   - Run `npm audit` regularly
   - Review dependencies before adding them

3. **Testing**
   - Test what the app reads from storage and links, as well as what it writes

## Known Security Considerations

### Current Implementation

1. **No server-side data**: there are no accounts, no database and no API routes. Every page is static, and saved stories and the API key stay in the browser.
2. **Story rendering**: story text is rendered as React text, never as HTML, wherever it came from (scene generator, AI, browser storage, a share link).
3. **Reading storage and links**: saved stories and shared stories are parsed with `savedStorySchema` and `sharedStorySchema` ([`lib/validation.js`](lib/validation.js)), which apply the story limits and drop unknown fields. Saved entries that don't parse aren't shown.
4. **Share links** ([`lib/shareLink.js`](lib/shareLink.js)): the story is compressed into the part of the link after `#`, which browsers don't send to the server. Learning needs, which describe the child, are left out. A link refuses data over 100,000 characters and stops unpacking past 200,000 bytes, so a crafted link can't make the browser expand a huge payload. A link can't be revoked: it holds the story itself.
5. **AI prompt input**: words are restricted to letters, apostrophes and hyphens before they reach the prompt.
6. **Anthropic API keys**: AI stories use each grown-up's own key. It is kept in their browser's localStorage until they remove it, and sent from the browser straight to Anthropic ([`lib/anthropicKey.js`](lib/anthropicKey.js), [`lib/aiStory.js`](lib/aiStory.js)). Anyone using the same browser can use it. Keys saved per account by earlier versions are removed when the app loads.
7. **Security headers**: a Content-Security-Policy on every page, set in [`next.config.js`](next.config.js). Scripts run only from this site and the exact jsDelivr paths of the OCR engine, so an injected inline script doesn't run. Requests can go only to this site, the Anthropic API and the OCR language data; the policy doesn't cover a script navigating the page to another site. Also `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` and `X-Frame-Options: DENY`. `style-src` allows inline styles, because server-rendered markup carries style attributes.

### Areas for Improvement

- [ ] The API key and saved stories are in localStorage, where any script running on the site can read them. The Content-Security-Policy is what keeps other scripts out
- [ ] No error monitoring; errors reach only the browser console

## Security Headers

The headers are set in `headers()` in [`next.config.js`](next.config.js), and [`test/config/securityHeaders.test.js`](test/config/securityHeaders.test.js) checks the policy. A new external service the browser talks to needs adding to `connect-src` (and `script-src` if it serves code), or the browser blocks it.

## Contact

For security concerns, use [private vulnerability reporting](https://github.com/ces0491/sight-word-app/security/advisories/new). For anything else, see [CONTRIBUTING.md](CONTRIBUTING.md).

---

Last updated: 2026-11-10
