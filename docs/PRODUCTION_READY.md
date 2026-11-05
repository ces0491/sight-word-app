# Production Readiness

**Status**: not ready for a public launch. The gaps are listed below.

**Last reviewed**: 2026-11-05

## In place

- **Checks**: `npm run lint`, `npm test` and `npm run build` pass locally. CI runs all three on Node 24.
- **Authentication**: NextAuth credentials provider with JWT sessions. API routes read the session with `getServerSession`.
- **Input validation**: Zod schemas in [`lib/validation.js`](../lib/validation.js) for the story, share, AI and analytics routes. Fields the client must not set (`userId`, `shareToken`, `sharedWith`) are dropped.
- **Story rendering**: story text is rendered as React text, so HTML in a story displays as text rather than running ([`components/story/StoryText.js`](../components/story/StoryText.js)).
- **Share links**: each shared story gets a random 256-bit token, stored on the story and compared in constant time. A wrong token, a missing story and an unshared story all return the same 404.
- **Share email**: user-supplied text is HTML-escaped and kept off header lines. Recipient addresses are validated.
- **AI generation**: signed-in users only. Words are limited to letters, apostrophes and hyphens before they reach the prompt. The response shape is enforced with structured outputs, and the server works out which sight words the story uses.
- **Rate limits**: AI generation and share emails are limited per user, with counters in MongoDB so the limit holds across serverless instances. Values are in [`lib/limits.js`](../lib/limits.js).
- **Missing configuration**: if a required setting such as `MONGODB_URI` is missing, API routes that need it return a JSON 503 (`SERVICE_NOT_CONFIGURED`) and log which setting is missing. Other routes keep working.
- **Children's area**: the grown-ups area (settings, sign-in, saved stories) sits behind a sum, asked once per browser tab. It keeps a young child out; it is not security.
- **Dependencies**: as of 2026-11-05, `npm audit --omit=dev` reports no critical advisories, one high (`postcss`, bundled inside `next` and fixed in Next 16) and six moderate.

## Gaps before a public launch

- **Error monitoring**: the `sentry.*.config.js` files are not loaded. There is no `instrumentation.js` and `next.config.js` does not use `withSentryConfig`, so errors only reach the server logs.
- **Registration and sign-in**: no rate limit on registration or sign-in attempts, no password length rule, and email addresses are stored as typed (case-sensitive).
- **Analytics are global**: the word usage dashboard and suggestions count words across all users, so one teacher's word lists (including any child's name entered as a word) are visible to every signed-in teacher.
- **Database tests**: API routes are unit-tested with the database mocked. Nothing runs them against a real MongoDB.
- **Next.js 16**: needed to clear the remaining `postcss` advisory.

## Deployment

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `MONGODB_DB` | Recommended | Database name inside the cluster. Without it the name comes from the connection string, and the driver falls back to `test` |
| `NEXTAUTH_URL` | Yes | Public base URL; also used to build share links |
| `NEXTAUTH_SECRET` | Yes | Signs session tokens. Generate with `openssl rand -base64 32` |
| `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD`, `EMAIL_FROM` | For sharing | SMTP settings. Port 465 uses implicit TLS; other ports use STARTTLS |
| `ANTHROPIC_API_KEY` | For AI mode | Billed per request. Without it, AI mode returns 503 and the app uses Classic mode |

Set the variables for both Production and Preview. Vercel applies variable changes only to new deployments, so redeploy after adding or changing them.

### Checks after deploying

1. Register and sign in.
2. Generate a story in Classic mode and in AI mode.
3. Save a story, then share it by email.
4. Open the emailed link in a private window.
5. Confirm a share link with its `token` changed returns "This story link is invalid or no longer available."
