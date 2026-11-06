# Production Readiness

**Status**: not ready for a public launch. The gaps are listed below.

**Last reviewed**: 2026-11-06

## In place

- **Checks**: `npm run lint` (ESLint over the whole project), `npm test` and `npm run build` pass locally. CI runs them on Node 24, the version in `engines` in `package.json`, which Vercel also uses.
- **Authentication**: NextAuth credentials provider with JWT sessions. API routes read the session with `getServerSession`, and answer a missing `NEXTAUTH_SECRET` with the 503 below.
- **Registration**: names of up to 60 letters, spaces, apostrophes, hyphens and full stops, passwords of 8 to 72 bytes, and emails stored lower-cased and matched case-insensitively at sign-up and sign-in. The body is validated before any query, so it can't carry query operators.
- **Sign-in redirects**: the page to return to after sign-in is followed only if it is on this site ([`lib/safeRedirect.js`](../lib/safeRedirect.js)).
- **Input validation**: Zod schemas in [`lib/validation.js`](../lib/validation.js) for registration, the story, share and analytics routes, and AI story input. Fields the client must not set (`userId`, `shareToken`, `sharedWith`) are dropped.
- **Story rendering**: story text is rendered as React text, so HTML in a story displays as text rather than running ([`components/story/StoryText.js`](../components/story/StoryText.js)).
- **Share links**: each shared story gets a random 256-bit token, stored on the story and compared in constant time. A wrong token, a missing story and an unshared story all return the same 404. Sharing can be stopped from the story library, which removes the token, and a shared story leaves out the learning needs.
- **Share email**: user-supplied text is HTML-escaped and kept off header lines. Recipient addresses are validated.
- **AI stories**: signed-in grown-ups with their own Anthropic API key. The key is kept in their browser's localStorage under their account and removed on sign-out, and the browser calls Anthropic directly, so this server never receives it. Words are limited to letters, apostrophes and hyphens before they reach the prompt, and the response shape is enforced with structured outputs.
- **Rate limits**: share emails and word-usage updates are limited per user, with counters in MongoDB so the limit holds across serverless instances. Values are in [`lib/limits.js`](../lib/limits.js).
- **Security headers**: a Content-Security-Policy in [`next.config.js`](../next.config.js) limits scripts to this site and the OCR engine's exact jsDelivr paths, and requests to this site, the Anthropic API and the OCR language data. A script injected into the page could not send a saved Anthropic API key anywhere else. Also `nosniff`, a strict referrer policy and `X-Frame-Options: DENY`.
- **Missing configuration**: if a required setting such as `MONGODB_URI` is missing, API routes that need it return a JSON 503 (`SERVICE_NOT_CONFIGURED`) and log which setting is missing. Other routes keep working.
- **Children's area**: the grown-ups area (settings, sign-in, saved stories) sits behind a sum, asked once per browser tab. It keeps a young child out; it is not security.
- **Dependencies**: as of 2026-11-06, `npm audit --omit=dev` reports no critical advisories, one high (the `postcss` copy that `next` pins) and one moderate (`next` itself). Both need Next.js 16. CI fails on critical advisories.

## Gaps before a public launch

- **Error monitoring**: none. Errors reach only the server logs. Adding a service such as Sentry also means adding its host to the Content-Security-Policy's `connect-src`.
- **Registration and sign-in**: no rate limit on registration or sign-in attempts, and no email verification.
- **Accounts can't be deleted** from the app.
- **Analytics are global**: the word usage dashboard counts words across all users. Only Dolch words are counted, so a child's name typed as a word doesn't appear, but every signed-in teacher sees the same totals.
- **Database tests**: API routes are unit-tested with the database mocked. Nothing runs them against a real MongoDB.
- **Next.js 16**: needed to clear the remaining `postcss` and `next` advisories.

## Deployment

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `MONGODB_DB` | Recommended | Database name inside the cluster. Without it the name comes from the connection string, and the driver falls back to `test` |
| `NEXTAUTH_URL` | Yes | Public base URL; also used to build share links |
| `NEXTAUTH_SECRET` | Yes | Signs session tokens. Generate with `openssl rand -base64 32` |
| `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD`, `EMAIL_FROM` | For sharing | SMTP settings. Port 465 uses implicit TLS; other ports use STARTTLS |

Set the variables for both Production and Preview. Vercel applies variable changes only to new deployments, so redeploy after adding or changing them.

### Checks after deploying

1. Register and sign in.
2. Generate a story in Classic mode. Add an Anthropic API key under Grown-ups → Account, generate a story in AI mode, then sign out and check the key is gone from Account.
3. Save a story, then share it by email.
4. Open the emailed link in a private window.
5. Confirm a share link with its `token` changed returns "This story link is invalid or no longer available."
6. Stop sharing the story from the story library, and confirm the emailed link no longer opens.
