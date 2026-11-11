# Accounts (removed)

Until November 2026 the app had accounts, a MongoDB database and server code. Now saved stories stay in the browser and a share link carries its story. This page records what that version had, the launch plan it was following, and what bringing accounts back would take.

The last commit with accounts is `caa73d1` on `main` (the merge of pull request #12), tagged `accounts-final`. To read or restore a file from it:

```bash
git show accounts-final:lib/authOptions.js
git checkout accounts-final -- pages/api
```

## Why they went

- **It's a free tool for parents and teachers.** Accounts made it a server that held information about children: learning needs, which can say something about a child's health or development (POPIA treats health information as special personal information), and any child's name typed into a story. Most of the remaining launch work existed because of that data: backups, scrubbing error reports, write limits and a POPIA review of what the database kept.
- **Email.** Password reset and email verification needed this app to keep a sending domain on Sheet Solved's Resend account, where the free tier allows only a few for all its apps. A portfolio app wasn't worth one, and without email a forgotten password would lose the account and its stories.

## What the account version had

| Part | How it worked | Where it was |
| --- | --- | --- |
| Sign-in | NextAuth 4 credentials provider, JWT sessions lasting 30 days that couldn't be revoked. Passwords hashed with bcrypt, 10 salt rounds. Names of up to 60 letters, spaces, apostrophes, hyphens and full stops; passwords of 8 to 72 bytes; emails stored lower-cased | `lib/authOptions.js`, `pages/api/auth/`, `pages/auth/`, `components/auth/`, `models/User.js` |
| Database | MongoDB Atlas, created through the Vercel Marketplace integration, with Mongoose 9. The integration's connection string carried no database name, so `MONGODB_DB` named it; without it the driver wrote to `test` | `lib/dbConnect.js`, `models/` |
| Stories API | List, create, read, update and delete, each limited to the signed-in account. Up to 200 stories per account | `pages/api/stories/` |
| Sharing | A random 256-bit token per story, compared in constant time, created once even when two shares started together. A missing story, an unshared story and a wrong token all got the same 404. Stopping sharing removed the token. Links went out by email, first through `nodemailer` and SMTP, then through Resend | `pages/api/stories/[id]/share.js`, `pages/api/shared-stories/[id].js`, `lib/email.js`, `lib/shareEmail.js` |
| Rate limits | Fixed windows counted in MongoDB, cleared by a TTL index: registration 5 an hour per IP address; sign-in 20 per 15 minutes per IP address and 10 per 15 minutes per email address (hashed); story saves and edits 60 an hour; share emails 10 an hour; word-usage updates 60 an hour; account deletion 5 per 15 minutes. The IP address came from Vercel's `x-real-ip` header | `lib/rateLimit.js`, `lib/limits.js`, `lib/clientIp.js`, `models/RateLimit.js` |
| Account deletion | Asked for the password again, then deleted the account and its stories | `pages/api/account.js` |
| Word usage dashboard | Counts of Dolch words across everyone, by reading level. Only Dolch words were counted, so a child's name never reached it | `pages/api/analytics/`, `models/WordAnalytics.js`, `components/analytics/WordUsageDashboard.js` |
| Sign-in redirects | The page to return to was followed only if it resolved to this site. A prefix check let `/<tab>/evil.example` through, because URL parsing drops tabs | `lib/safeRedirect.js` |
| Missing configuration | API routes answered a missing setting with a JSON 503, `SERVICE_NOT_CONFIGURED`, and logged which one | `lib/apiHelpers.js`, `lib/errors.js` |
| Tests | API routes tested with the database and session mocked | `test/api/`, `test/apiTestUtils.js` |

Outside the code, it used:

- **Vercel environment variables**: `MONGODB_URI` (managed by the Atlas integration), `MONGODB_DB`, `NEXTAUTH_URL` and `NEXTAUTH_SECRET`, plus `RESEND_API_KEY` and `EMAIL_FROM`. The auth and email variables were set for Production only, so preview deploys couldn't sign in or send email.
- **MongoDB Atlas**: a database in Cape Town, through the Vercel Marketplace integration.
- **Resend**: the sending domain `sightwords.sheetsolved.com`, verified with a DKIM record and two sending records under `sightwords` in the sheetsolved.com DNS at GoDaddy, and an API key for this app.

## Where it was heading

The launch plan in `SCOPE.md` as of 2026-11-06, after story write limits (#10), the privacy page (#11) and Resend (#12):

1. Password reset by email: a single-use link that expires, with requests rate-limited.
2. Email verification, with signing in blocked until an address is verified.
3. Error monitoring, with no story text, email addresses or API keys in events, the service allowed by the Content-Security-Policy and named on the privacy page.
4. Backups on for the production database, one restore into a scratch database, and backup retention stated on the privacy page.
5. A POPIA check of the privacy page.
6. The live checks in `docs/PRODUCTION_READY.md`, then the readiness status set to ready.

Revoking sessions, tests against a real MongoDB, word analytics per account and audit logging were out of scope.

## Bringing accounts back

- **Decide email first.** Password reset and verification need a sender. One sending domain could serve several Sheet Solved apps, each sending from its own address there, so this app wouldn't take a domain of its own. Without email, recovery codes shown once at sign-up could reset a password, and verification could stay out: the app would never send anything to the address.
- **Keep learning needs in the browser.** They're the most sensitive thing the app holds, and nothing on a server needs them. Leaving them out of the database keeps health information off it, even with accounts.
- **Bring the browser library across.** Stories saved in the browser have an id and a date (`lib/storyLibrary.js`), so a first sign-in could offer to upload them.
- **Keep share links that carry the story.** They work without a server. Server-side tokens are only needed for links that can be revoked.
- **Check the dependencies.** `caa73d1` used `next-auth` 4.24, `mongoose` 9.12 and `bcrypt` 6. Check each is still current before restoring the code that uses it.
- **Known gaps to close or accept again**: JWT sessions can't be revoked, so a copied cookie lasts 30 days; the per-email sign-in limit lets anyone who knows an address lock its owner out for up to 15 minutes; preview deploys need their own auth variables to sign in.
