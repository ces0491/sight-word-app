# Free and Open Source

Sight Word Stories is MIT-licensed (see [LICENSE](../LICENSE)) and is built so that running it costs nothing beyond a free hosting tier.

---

## What Costs Nothing

- **Classic stories** are put together in the browser from written scenes ([`lib/storyComposer.js`](../lib/storyComposer.js)). No server or paid service is involved.
- **Illustrations** are SVG pictures drawn in the browser ([`lib/imageGeneration.js`](../lib/imageGeneration.js)), so there's no image service to pay for.
- **Reading aloud** uses the browser's built-in speech.
- **Scanning a page** runs the Tesseract OCR engine in the browser. The photo isn't uploaded anywhere; the engine and its English language data are downloaded from jsDelivr the first time.
- **Saving and sharing** happen in the browser: saved stories are kept in its storage, and a share link carries the story itself.
- **Hosting**: the app is static pages with no database or server code, which fits [Vercel's](https://vercel.com/pricing) free tier. Its limits and prices change, so check that page.

## AI Stories

AI stories are an optional extra written by Claude Haiku 4.5. Each grown-up adds their own Anthropic API key under Grown-ups → AI stories, and Anthropic bills their account for the stories they make. Whoever runs the site pays nothing for them, and a deployment needs no Anthropic key. Output is capped at 1,024 tokens a story.

---

## What the App Stores

Nothing on a server. In the browser:

- **Saved stories**, in localStorage ([`lib/storyLibrary.js`](../lib/storyLibrary.js)): title, sentences, sight words, display settings, reading level, learning needs and the date. They stay until they're deleted in the story library or the site's data is cleared.
- **The Anthropic API key**, in localStorage until it's removed.
- **The words, settings and newest unsaved story**, and the grown-up check, in sessionStorage until the tab closes.

Scanned photos never leave the browser.

What leaves the browser:

- **AI stories** send the chosen words, the reading level and the selected learning needs to Anthropic, with the grown-up's own key.
- **Share links** carry the story, without its learning needs, to whoever the grown-up sends them to ([`lib/shareLink.js`](../lib/shareLink.js)). The story is in the part of the link after `#`, which browsers don't send to the server.

---

## Self-Hosting

To run your own copy you need somewhere to host a Next.js app; the project is set up for Vercel. The [Quick Start Guide](QUICK_START.md) and the [README](../README.md) cover the setup.

## Support and Contributing

Bugs and suggestions go in [GitHub issues](https://github.com/ces0491/sight-word-app/issues). See [CONTRIBUTING.md](../CONTRIBUTING.md) to contribute and [SECURITY.md](../SECURITY.md) to report a security problem.

The software is provided "as is", without warranty; see the [LICENSE](../LICENSE).
