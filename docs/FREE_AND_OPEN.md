# Free and Open Source

Sight Word Stories is MIT-licensed (see [LICENSE](../LICENSE)) and is built so that running it costs nothing beyond free hosting tiers.

---

## What Costs Nothing

- **Classic stories** are put together in the browser from written scenes ([`lib/storyComposer.js`](../lib/storyComposer.js)). No server or paid service is involved.
- **Illustrations** are SVG pictures drawn in the browser ([`lib/imageGeneration.js`](../lib/imageGeneration.js)), so there's no image service to pay for.
- **Reading aloud** uses the browser's built-in speech.
- **Scanning a page** runs the Tesseract OCR engine in the browser. The photo isn't uploaded anywhere; the engine and its English language data are downloaded from jsDelivr the first time.
- **Hosting** fits the free tiers of [MongoDB Atlas](https://www.mongodb.com/pricing) and [Vercel](https://vercel.com/pricing). Their limits and prices change, so check those pages.
- **Email sharing** is optional. It works with any SMTP server, including a free Gmail account with an app password.

## AI Stories

AI stories are an optional extra written by Claude Haiku 4.5. Each grown-up signs in and adds their own Anthropic API key under Grown-ups → Account, and Anthropic bills their account for the stories they make. Whoever runs the site pays nothing for them, and a deployment needs no Anthropic key. Output is capped at 1,024 tokens a story.

---

## What the App Stores

In MongoDB:

- **Accounts**: name, email address (lower-cased) and a bcrypt hash of the password.
- **Saved stories**: title, sentences, sight words, display settings, reading level and learning needs, and the email addresses a story has been shared with.
- **Share tokens**: one random token per shared story. Stopping sharing from the story library removes it, and every link sent stops working.
- **Word usage**: how often each Dolch word has been used in stories, by reading level, across everyone who uses the app. Nothing links a count to an account, and words that aren't on the Dolch lists, such as a child's name, aren't counted.
- **Rate-limit counters**: keyed by account, by IP address (registration and sign-in) or by a hash of the email address (sign-in), and deleted automatically when their time window ends.

Not stored on the server:

- **Anthropic API keys** stay in the grown-up's browser and are removed on sign-out.
- **Scanned photos** never leave the browser.

What leaves the browser:

- **AI stories** send the chosen words, the reading level and the selected learning needs to Anthropic, with the grown-up's own key.
- **Share emails** go through the deployment's SMTP server to the address entered.

Saved stories can be deleted from the story library. Deleting the account, under Grown-ups → Account, deletes its saved stories too; the word usage counts stay, as nothing links them to the account.

---

## Self-Hosting

To run your own copy you need a MongoDB database, somewhere to host a Next.js app (the project is set up for Vercel), and optionally an SMTP account for email sharing. The [Quick Start Guide](QUICK_START.md) and the [README](../README.md) cover the setup.

## Support and Contributing

Bugs and suggestions go in [GitHub issues](https://github.com/ces0491/sight-word-app/issues). See [CONTRIBUTING.md](../CONTRIBUTING.md) to contribute and [SECURITY.md](../SECURITY.md) to report a security problem.

The software is provided "as is", without warranty; see the [LICENSE](../LICENSE).
