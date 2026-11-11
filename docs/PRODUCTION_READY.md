# Production Readiness

**Status**: not ready for a public launch. The gaps are listed below, and [SCOPE.md](../SCOPE.md) sets what a launch needs.

**Last reviewed**: 2026-11-10

## In place

- **Checks**: `npm run lint` (ESLint over the whole project), `npm test` and `npm run build` pass locally. CI runs them on Node 24, the version in `engines` in `package.json`, which Vercel also uses.
- **No server-side data**: no accounts, no database and no API routes. Every page is static. Saved stories and the API key stay in the browser ([`lib/storyLibrary.js`](../lib/storyLibrary.js), [`lib/anthropicKey.js`](../lib/anthropicKey.js)), and storage that's full or blocked gets a message saying so. [Accounts (removed)](ACCOUNTS.md) records the version with accounts.
- **Privacy page**: [`/privacy`](../pages/privacy.js) says what stays in the browser, what a share link carries, which outside services are involved and how to remove things, with a contact address. The Grown-ups area links to it. A test fails if the Content-Security-Policy allows an outside host the page doesn't name.
- **Reading storage and links**: saved and shared stories are parsed with the schemas in [`lib/validation.js`](../lib/validation.js), which apply the story limits and drop unknown fields. Saved entries that don't parse are kept in storage but not shown.
- **Story rendering**: story text is rendered as React text, so HTML in a story displays as text rather than running ([`components/story/StoryText.js`](../components/story/StoryText.js)).
- **Share links**: the story, without its learning needs, is compressed into the part of the link after `#`, which browsers don't send to the server ([`lib/shareLink.js`](../lib/shareLink.js)). Opening a link reads the story in the browser, and it can be saved there. A damaged or crafted link shows a message instead of a story.
- **AI stories**: each grown-up's own Anthropic API key, kept in their browser's localStorage until they remove it, and sent from the browser straight to Anthropic. Words are limited to letters, apostrophes and hyphens before they reach the prompt, and the response shape is enforced with structured outputs.
- **Security headers**: a Content-Security-Policy in [`next.config.js`](../next.config.js) limits scripts to this site and the OCR engine's exact jsDelivr paths, and requests to this site, the Anthropic API and the OCR language data. An injected inline script doesn't run. The policy doesn't stop a script navigating the page to another site, which could carry a saved Anthropic API key in the URL. Also `nosniff`, a strict referrer policy and `X-Frame-Options: DENY`.
- **Grown-ups area**: settings, saved stories and the API key sit behind a sum, asked once per browser tab. It keeps a young child out; it is not security.
- **Dependencies**: as of 2026-11-10, `npm audit --omit=dev` reports no advisories. CI fails on critical advisories.

## Gaps before a public launch

These are the items in [SCOPE.md](../SCOPE.md) that aren't in place yet.

- **POPIA check**: the privacy page hasn't yet been checked against POPIA's rules on children's and health information.
- **Error monitoring**: none. Errors reach only the browser console. Adding a service such as Sentry also means adding its host to the Content-Security-Policy's `connect-src` and naming it on the privacy page.
- **Live checks**: the checks below haven't been run on the live site since accounts were removed.

## Known limitations

[SCOPE.md](../SCOPE.md) leaves these out of the launch.

- **Stories stay in one browser**: there's no sync between devices, and clearing the site's data deletes them. A story moves to another device by sharing it and saving it from the link there, without its learning needs.
- **Share links can't be revoked**: a link holds the story itself, so deleting the story doesn't stop a link that's been sent.
- **Shared computers**: anyone using the same browser can open the saved stories and use the saved API key.
- **Long links**: a link grows with its story, and some apps cut long links short. The page then says the link is damaged.
- **Older browsers**: Tailwind CSS 4 needs Safari 16.4, Chrome 111, Firefox 128 or newer, so pages won't look right on older tablets, such as iPads that can't update past iPadOS 15. Tailwind CSS 3.4 is the way back if those matter.

## Deployment

The app needs no environment variables. On Vercel, a push to `main` deploys it.

### Checks after deploying

1. Make a Classic story and save it from its last page. Reload: it's on the shelf and in the story library.
2. Edit the story in the library, then delete another one.
3. Share a story, copy the link, open it in a private window, and save it there.
4. Remove the last few characters of the link and open it: the page says the link is damaged.
5. Add an Anthropic API key under Grown-ups → AI stories and make an AI story. Remove the key and check AI is off.
6. Keep the browser console open throughout: no Content-Security-Policy errors.
