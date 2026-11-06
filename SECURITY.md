# Security Policy

## Supported Versions

These versions get security updates:

| Version | Supported |
| --- | --- |
| `main` and 1.1.x | Yes |
| < 1.1 | No |

## Reporting a Vulnerability

Please don't report security problems in public GitHub issues.

### How to Report

Use GitHub's private vulnerability reporting: [report a vulnerability](https://github.com/ces0491/sight-word-app/security/advisories/new), or go to the repository's **Security** tab and click **Report a vulnerability**. Only the maintainer sees the report.

### What to Include

- **Type of vulnerability** (e.g., query injection, XSS, authentication bypass)
- **Location** (file path, URL, or component)
- **Steps to reproduce** the issue
- **Potential impact**
- **Suggested fix**, if you have one

### Example Report

```text
Subject: [SECURITY] Query operator accepted in sign-in

Steps to Reproduce:
1. Open /auth/signin
2. Send {"email": {"$ne": null}, "password": "x"} as the sign-in body

Impact:
An attacker could sign in without knowing an email address.

Suggested Fix:
Check that the email is a string before it reaches the query.
```

## Response and Disclosure

The maintainer aims to reply within a few days. How soon a fix ships depends on severity.

Reports are confirmed, checked and fixed, and the fix is released before anything is made public. Please don't disclose the problem until then. Reporters are credited in the security advisory unless they'd rather not be.

## Security Best Practices

### For Administrators

1. **Keep software updated**
   - Update dependencies regularly
   - Watch the repository on GitHub for security advisories

2. **Secure your environment**
   - Use strong, unique passwords
   - Turn on two-factor authentication for the GitHub, Vercel and MongoDB Atlas accounts
   - Keep secrets in environment variables; `.env.local` is git-ignored and stays out of version control

3. **Rotate credentials**
   - Change database passwords regularly
   - Change `NEXTAUTH_SECRET` if it may have leaked; this signs everyone out

4. **Database**
   - Restrict the Atlas IP access list if the host has fixed outbound IPs
   - Use TLS for database connections
   - Give the database user only the permissions the app needs

5. **Email**
   - Give the Resend API key the narrowest permission that can send, restricted to the sending domain
   - Keep the key in the hosting environment only; it can send email as the app

### For Developers

1. **Code**
   - Validate request bodies with the Zod schemas in [`lib/validation.js`](lib/validation.js) before they reach a query. Mongoose passes query operators such as `$regex` through, so an unvalidated `{ "email": { "$regex": "^a" } }` becomes part of the query
   - Render user text as React text, never as HTML
   - Rate-limit endpoints that send email or check passwords ([`lib/rateLimit.js`](lib/rateLimit.js))

2. **Authentication**
   - Use bcrypt with salt rounds ≥ 10
   - Leave session and JWT handling to NextAuth ([`lib/authOptions.js`](lib/authOptions.js))

3. **Dependencies**
   - Run `npm audit` regularly
   - Review dependencies before adding them

4. **Testing**
   - Test authentication, authorization and input validation

## Known Security Considerations

### Current Implementation

1. **Password storage**: bcrypt with 10 salt rounds.
2. **Sessions**: JWT-based with NextAuth. API routes read the session with `getServerSession`.
3. **Input validation**: Zod schemas on registration, account deletion, the story, share and analytics routes, and AI story input ([`lib/validation.js`](lib/validation.js)), checked before any query. Unknown fields are dropped, so clients can't set `userId`, `shareToken` or `sharedWith`.
   - Registration: names of up to 60 letters, spaces, apostrophes, hyphens and full stops (they appear in share emails), passwords of 8 to 72 bytes, and emails stored lower-cased and looked up case-insensitively.
4. **Story rendering**: story text is rendered as React text, never as HTML, wherever it came from (scene generator, AI, database).
5. **Share links**: a random 256-bit token per story, compared in constant time, created once even when two shares start together. Wrong tokens and missing stories get the same 404. The owner can stop sharing from the story library, which removes the token. The shared story leaves out the learning needs, which describe the child.
6. **Share email**: user text is HTML-escaped, and line breaks are removed from the subject.
7. **Rate limiting**, counted in MongoDB ([`lib/limits.js`](lib/limits.js)):
   - Registration, per IP address
   - Sign-in, per IP address and per email address (stored hashed). Someone who knows an address can use up its attempts and hold its owner off for up to 15 minutes
   - Story saves and edits (counted together), share emails, word-usage updates and account deletion, per account
   - Saved stories, capped per account so one account can't fill the database
8. **Word usage** is shared by every signed-in teacher, so it counts Dolch words only: other words, such as a child's name, never reach it.
9. **Sign-in redirects**: after sign-in, the `callbackUrl` is followed only if it resolves to a page on this site ([`lib/safeRedirect.js`](lib/safeRedirect.js)). A prefix check isn't enough, because URL parsing drops tabs and turns `/<tab>/evil.example` into another site.
10. **AI prompt input**: words are restricted to letters, apostrophes and hyphens before they reach the prompt.
11. **Anthropic API keys**: AI stories use each grown-up's own key. It is kept in their browser's localStorage under their account id, removed on sign-out, and sent from the browser straight to Anthropic; the app's server never receives it ([`lib/anthropicKey.js`](lib/anthropicKey.js), [`lib/aiStory.js`](lib/aiStory.js)).
12. **Account deletion**: asks for the password again, then deletes the account and its saved stories ([`pages/api/account.js`](pages/api/account.js)).
13. **CSRF**: NextAuth protects its own auth routes. The session cookie is `SameSite=Lax`, so other sites' pages can't send it with the app's API requests.
14. **Security headers**: a Content-Security-Policy on every page, set in [`next.config.js`](next.config.js). Scripts run only from this site and the exact jsDelivr paths of the OCR engine, so an injected inline script doesn't run. Requests can go only to this site, the Anthropic API and the OCR language data; the policy doesn't cover a script navigating the page to another site. Also `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` and `X-Frame-Options: DENY`. `style-src` allows inline styles, because server-rendered markup carries style attributes.

### Areas for Improvement

- [ ] Sessions can't be revoked: a copied session cookie keeps working until it expires (30 days), even after sign-out or account deletion
- [ ] No email verification at registration
- [ ] No audit logging
- [ ] No error monitoring; errors reach only the server logs

## Security Headers

The headers are set in `headers()` in [`next.config.js`](next.config.js), and [`test/config/securityHeaders.test.js`](test/config/securityHeaders.test.js) checks the policy. A new external service the browser talks to needs adding to `connect-src` (and `script-src` if it serves code), or the browser blocks it.

## Environment Checklist

- [ ] Secrets in environment variables
- [ ] Different credentials for development and production
- [ ] A long random `NEXTAUTH_SECRET` (`openssl rand -base64 32`)
- [ ] Database connection over TLS
- [ ] A Resend API key restricted to the sending domain

## Contact

For security concerns, use [private vulnerability reporting](https://github.com/ces0491/sight-word-app/security/advisories/new). For anything else, see [CONTRIBUTING.md](CONTRIBUTING.md).

---

Last updated: 2026-11-06
