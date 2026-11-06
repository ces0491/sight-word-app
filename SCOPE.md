# SCOPE — Sight Word Stories

## Purpose

A free web app where a grown-up turns the sight words a child is learning into short illustrated stories to read together, open to any parent or teacher.

## Done

The app is ready for a public launch when each of these holds on [sightwords.sheetsolved.com](https://sightwords.sheetsolved.com/):

- [ ] Story writes are limited: `POST` and `PUT /api/stories` are rate-limited per account, and an account can hold only a set number of stories. Both values are in [`lib/limits.js`](lib/limits.js) and covered by tests.
- [ ] A privacy page says what the app stores (name, email, hashed password, saved stories with their learning needs), where it's kept, how to delete it and who to contact. The sign-up page links to it.
- [ ] Ces has checked the privacy page against POPIA's rules on children's and health information, and the app does what the page says.
- [ ] SMTP is set up in production, and sharing a story by email works on the live site.
- [ ] Password reset by email, with a single-use link that expires and a rate limit on requests.
- [ ] Email verification: signing in needs a verified address. Ces's existing account is marked verified.
- [ ] Server and browser errors reach an error-monitoring service that alerts Ces. Events carry no story text, email addresses or Anthropic API keys, and the Content-Security-Policy allows the service.
- [ ] Backups are on for the production database, and a restore into a scratch database has worked once.
- [ ] The checks under "Checks after deploying" in [`docs/PRODUCTION_READY.md`](docs/PRODUCTION_READY.md) pass on the live site, including an AI story made with Ces's own key.
- [ ] CI passes on `main`: lint, tests, build and the production `npm audit`.
- [ ] [`README.md`](README.md), [`SECURITY.md`](SECURITY.md), [`docs/API.md`](docs/API.md) and [`docs/PRODUCTION_READY.md`](docs/PRODUCTION_READY.md) describe the app as shipped, and the readiness status reads ready.

## Out of scope

- Revoking sessions. They stay signed JWTs that last 30 days, as [`SECURITY.md`](SECURITY.md) describes.
- Tests against a real MongoDB. API routes stay unit-tested with the database mocked, and the live checks cover the real one.
- Word analytics per account. The dashboard stays a shared count of Dolch words.
- Browsers older than Safari 16.4, Chrome 111 and Firefox 128, the floor Tailwind CSS 4 sets.
- A site-wide Anthropic API key. AI stories stay on each grown-up's own key.
- Accounts for children. Children use the app with a grown-up and never sign in.
- Audit logging.

## Bar

Production: a public web app that holds information about children. Write endpoints are validated and rate-limited, errors reach someone who will act on them, owners can delete their data, and nothing about a child leaves the app unless a grown-up sends it (by sharing a story, or by making an AI story with their own Anthropic key). Lint, tests and build gate each pull request.

## Decision

Ces decides when each item holds. Once they all do, the status in [`docs/PRODUCTION_READY.md`](docs/PRODUCTION_READY.md) changes to ready and the app can be offered to other parents and teachers.

## Revision history

- 2026-11-06: initial scope, from that day's production-readiness review
