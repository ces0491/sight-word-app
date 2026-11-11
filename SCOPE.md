# SCOPE — Sight Word Stories

## Purpose

A free web app where a grown-up turns the sight words a child is learning into short illustrated stories to read together, open to any parent or teacher.

## Done

The app is ready for a public launch when each of these holds on [sightwords.sheetsolved.com](https://sightwords.sheetsolved.com/):

- [ ] A privacy page says what stays in the browser (saved stories with their learning needs, the API key), what a share link carries, which outside services are involved, how to remove things and who to contact. The Grown-ups area links to it.
- [ ] Ces has checked the privacy page against POPIA's rules on children's and health information, and the app does what the page says.
- [ ] Browser errors reach an error-monitoring service that alerts Ces. Events carry no story text or Anthropic API keys, the Content-Security-Policy allows the service, and the privacy page names it.
- [ ] The checks under "Checks after deploying" in [`docs/PRODUCTION_READY.md`](docs/PRODUCTION_READY.md) pass on the live site, including an AI story made with Ces's own key.
- [ ] CI passes on `main`: lint, tests, build and the production `npm audit`.
- [ ] [`README.md`](README.md), [`SECURITY.md`](SECURITY.md) and [`docs/PRODUCTION_READY.md`](docs/PRODUCTION_READY.md) describe the app as shipped, and the readiness status reads ready.

## Out of scope

- Accounts, a database and server code. Stories stay in the browser that saved them, a share link carries its story, and the app sends no email. [`docs/ACCOUNTS.md`](docs/ACCOUNTS.md) records the version with accounts and what bringing them back would take.
- Syncing stories between devices. A story moves by sharing it and saving it from the link.
- Revoking share links. A link holds the story itself.
- Browsers older than Safari 16.4, Chrome 111 and Firefox 128, the floor Tailwind CSS 4 sets.
- A site-wide Anthropic API key. AI stories stay on each grown-up's own key.
- Accounts for children. Children use the app with a grown-up.

## Bar

Production: a public web app used with children. Nothing about a child reaches a server the app runs. A story leaves the browser only when a grown-up shares it, without its learning needs, or makes an AI story with their own Anthropic key. Anything read from browser storage or a link is validated before use. Lint, tests and build gate each pull request.

## Decision

Ces decides when each item holds. Once they all do, the status in [`docs/PRODUCTION_READY.md`](docs/PRODUCTION_READY.md) changes to ready and the app can be offered to other parents and teachers.

## Revision history

- 2026-11-06: initial scope, from that day's production-readiness review
- 2026-11-06: the email, error-monitoring and backup items also bring the privacy page up to date
- 2026-11-06: email goes through Resend, as in Sheet Solved's other apps
- 2026-11-10: no accounts, database or email. Stories stay in the browser and share links carry the story, so the write-limit, email, password-reset, email-verification and backup items go
