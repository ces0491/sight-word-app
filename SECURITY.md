# Security Policy

## Supported Versions

We take security seriously. The following versions of Sight Word Story Generator are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| `main` and 1.1.x | :white_check_mark: |
| < 1.1   | :x:                |

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

### How to Report

Use GitHub's private vulnerability reporting: [report a vulnerability](https://github.com/ces0491/sight-word-app/security/advisories/new), or go to the repository's **Security** tab and click **Report a vulnerability**. Only the maintainer sees the report.

### What to Include

Please include the following information:

- **Type of vulnerability** (e.g., SQL injection, XSS, authentication bypass)
- **Location** (file path, URL, or specific component)
- **Step-by-step instructions** to reproduce the issue
- **Potential impact** of the vulnerability
- **Suggested fix** (if you have one)
- **Your contact information** for follow-up

### Example Report

```text
Subject: [SECURITY] Authentication Bypass in User Login

Description:
I found a way to bypass authentication by...

Steps to Reproduce:
1. Navigate to /login
2. Enter username: admin' OR '1'='1
3. [etc.]

Impact:
An attacker could gain unauthorized access to any user account.

Suggested Fix:
Use parameterized queries instead of string concatenation.

Contact: researcher@security.com
```

## Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 1-7 days
  - High: 7-30 days
  - Medium: 30-90 days
  - Low: Next scheduled release

## Security Update Process

1. **Acknowledgment**: We'll confirm receipt of your report
2. **Investigation**: We'll verify and assess the vulnerability
3. **Fix Development**: We'll develop and test a patch
4. **Disclosure**: We'll coordinate disclosure with you
5. **Release**: We'll release the fix and credit you (if desired)

## Vulnerability Disclosure Policy

We follow coordinated disclosure:

- We'll work with you to understand and fix the issue
- We won't publicly disclose until a fix is available
- We'll credit you in the security advisory (unless you prefer anonymity)
- We ask that you don't publicly disclose before we release a fix

## Security Best Practices

### For Users/Administrators

1. **Keep Software Updated**
   - Always use the latest version
   - Update dependencies regularly
   - Subscribe to security announcements

2. **Secure Your Environment**
   - Use strong, unique passwords
   - Enable two-factor authentication (when available)
   - Keep your `.env.local` file secure
   - Never commit credentials to version control
   - Use environment variables for secrets

3. **Rotate Credentials**
   - Change database passwords regularly
   - Rotate API keys every 90 days
   - Update NextAuth secret on security concerns

4. **Database Security**
   - Use MongoDB Atlas with IP whitelisting
   - Enable MongoDB authentication
   - Use TLS/SSL for database connections
   - Limit database user permissions (principle of least privilege)

5. **Email Security**
   - Use app-specific passwords for SMTP
   - Don't store email passwords in plain text
   - Use secure SMTP connections (TLS)

### For Developers

1. **Code Security**
   - Never commit `.env.local` or secrets
   - Validate request bodies with the Zod schemas in [`lib/validation.js`](lib/validation.js) before they reach a query. Mongoose passes query operators such as `$regex` through, so an unvalidated `{ "email": { "$regex": "^a" } }` becomes part of the query
   - Sanitize HTML output
   - Implement rate limiting on APIs
   - Use HTTPS in production

2. **Authentication**
   - Use bcrypt with salt rounds ≥ 10
   - Implement proper session management
   - Validate JWT tokens correctly
   - Use secure, random secrets

3. **Dependencies**
   - Run `npm audit` regularly
   - Update dependencies to patch vulnerabilities
   - Review dependencies before adding them

4. **Testing**
   - Test authentication and authorization
   - Test input validation
   - Test for common vulnerabilities (OWASP Top 10)

## Known Security Considerations

### Current Implementation

1. **Password storage**: bcrypt with 10 salt rounds.
2. **Sessions**: JWT-based with NextAuth. API routes read the session with `getServerSession`.
3. **Input validation**: Zod schemas on registration, the story, share and analytics routes, and AI story input ([`lib/validation.js`](lib/validation.js)), checked before any query. Unknown fields are dropped, so clients can't set `userId`, `shareToken` or `sharedWith`.
   - Registration: names of up to 60 letters, spaces, apostrophes, hyphens and full stops (they appear in share emails), passwords of 8 to 72 bytes, and emails stored lower-cased and looked up case-insensitively.
4. **Story rendering**: story text is rendered as React text, never as HTML, wherever it came from (scene generator, AI, database).
5. **Share links**: a random 256-bit token per story, compared in constant time, created once even when two shares start together. Wrong tokens and missing stories get the same 404. The owner can stop sharing from the story library, which removes the token. The shared story leaves out the learning needs, which describe the child.
6. **Share email**: user text is HTML-escaped, and line breaks are removed from the subject.
7. **Rate limiting**: share emails and word-usage updates, per user, counted in MongoDB ([`lib/limits.js`](lib/limits.js)). Word usage is shared by every signed-in teacher, so it counts Dolch words only: other words, such as a child's name, never reach it.
8. **Sign-in redirects**: after sign-in, the `callbackUrl` is followed only if it resolves to a page on this site ([`lib/safeRedirect.js`](lib/safeRedirect.js)); a prefix check alone let `/<tab>/evil.example` through.
9. **AI prompt input**: words are restricted to letters, apostrophes and hyphens before they reach the prompt.
10. **Anthropic API keys**: AI stories use each grown-up's own key. It is kept in their browser's localStorage under their account id, removed on sign-out, and sent from the browser straight to Anthropic; the app's server never receives it ([`lib/anthropicKey.js`](lib/anthropicKey.js), [`lib/aiStory.js`](lib/aiStory.js)).
11. **CSRF**: NextAuth protects its own auth routes.
12. **Security headers**: a Content-Security-Policy on every page, set in [`next.config.js`](next.config.js). Scripts run only from this site and the exact jsDelivr paths of the OCR engine, and the page can only send requests to this site, the Anthropic API and the OCR language data, so injected script could neither run nor send a saved API key elsewhere. Also `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` and `X-Frame-Options: DENY`. `style-src` allows inline styles, because server-rendered markup carries style attributes.

### Areas for Improvement

- [ ] Rate limit registration and sign-in attempts
- [ ] Implement audit logging
- [ ] Implement account lockout after failed attempts
- [ ] Add error monitoring; errors reach only the server logs today
- [ ] Let people delete their account

## Responsible Disclosure Hall of Fame

We recognize security researchers who help us keep our users safe:

*No researchers credited yet - be the first!*

## Security-Related Configuration

### Security Headers

The headers are set in `headers()` in [`next.config.js`](next.config.js), and [`test/config/securityHeaders.test.js`](test/config/securityHeaders.test.js) checks the policy. A new external service the browser talks to needs adding to `connect-src` (and `script-src` if it serves code), or the browser blocks it.

### Environment Security Checklist

- [ ] All secrets in environment variables
- [ ] `.env.local` in `.gitignore`
- [ ] Different credentials for dev/prod
- [ ] Strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] Database connection uses TLS
- [ ] Email uses secure SMTP
- [ ] API keys have limited permissions

## Contact

For security concerns, use [private vulnerability reporting](https://github.com/ces0491/sight-word-app/security/advisories/new). For anything else, see [CONTRIBUTING.md](CONTRIBUTING.md).

---

Last updated: 2026-11-06
