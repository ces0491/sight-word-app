# Sight Word Stories

Short illustrated stories built from the sight words a child is learning, to read together. A grown-up picks the words; the child taps them to hear them, reads the story a page at a time, and finishes with a word hunt.

[Sight Word Stories](https://sightwords.sheetsolved.com/)

**Status**: see the [Production Readiness](docs/PRODUCTION_READY.md) page for what is in place and what remains before a public launch.

---

## Features

**Story time, for the child**

- **Word cards**: the words to practise as big cards; tap one to hear it
- **One page at a time**: a large picture, large text in [Andika](https://software.sil.org/andika/) (a typeface made for beginning readers), and Back and Next buttons (or the arrow keys)
- **Read-aloud**: tap any word to hear it, or "Read to me" to hear the page with each word lit up as it's spoken. Uses the browser's built-in speech, so it's free and works without an account; the voice depends on the device
- **Word hunt**: after the story, hear a word and find its card, earning a star for each
- **Pictures that follow the story**: the same characters on every page, in a setting that matches the sentence (bedroom, kitchen, park, classroom and more)

**Grown-ups, behind a simple sum**

- **Words to practise**: type them, upload a list, scan a page, or pick from the Dolch sight word lists by level. A story takes up to 100 words. Scanning picks out the words on the Dolch lists that it reads exactly; others can be typed
- **Stories that use the words**: a Classic story uses each Dolch word on its own, and as many of a longer list as its scenes and up to ten extra sentences allow. The word hunt and highlights use only the words that are on the page
- **Two story makers**:
  - **Classic** builds a day-in-the-life story from written scenes, in the browser. Free, and no account needed.
  - **AI** writes a story with Claude Haiku 4.5, using the grown-up's own Anthropic API key. They sign in and add the key under Account, and Anthropic bills their account for each story. The key is kept in that browser, removed on sign-out, and sent from the browser straight to Anthropic, so this app's server never receives it. If AI generation fails, the app falls back to Classic.
- **Reading level** from Kindergarten to Grade 3, the span of the Dolch lists. AI stories are written for it; Classic stories are the same at every level and save it as a label for sorting the library.
- **Sight word style** (highlighted, bold, underlined or plain) and pictures on or off
- **Learning needs**: settings that change how a story reads (below)
- **Save, share and print**: save stories to an account, email a link (needs SMTP settings), print every page, and manage saved stories in the story library, where sharing can also be stopped
- **Deleting an account**: under Account, with the password; it removes the account and its saved stories
- **Kept on a reload**: the words, settings and newest unsaved story stay for the browser tab; the story editor asks before leaving with unsaved changes

## Cost

Classic mode, the SVG illustrations, the MongoDB Atlas free tier and Vercel's free tier have no running cost. Email sharing works with a free Gmail account and an app password. AI stories are billed to each grown-up's own Anthropic account at Claude Haiku 4.5 rates, with output capped at 1,024 tokens a story, so they cost whoever runs the site nothing. More in [Why It's Free](docs/FREE_AND_OPEN.md).

## Browser support

The styles use Tailwind CSS 4, which needs Safari 16.4, Chrome 111, Firefox 128 or newer. In older browsers, such as on iPads that can't update past iPadOS 15, pages won't look right.

## Getting Started

### Prerequisites

- Node.js 24 (set in `engines` in `package.json`; CI and Vercel use it too)
- npm
- A MongoDB database (the MongoDB Atlas free tier works)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ces0491/sight-word-app.git
   cd sight-word-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Then fill in `.env.local`:

   | Variable | Required | Purpose |
   | --- | --- | --- |
   | `MONGODB_URI` | Yes | MongoDB connection string |
   | `MONGODB_DB` | Recommended | Database name inside the cluster, e.g. `sight-word-stories`. Without it the name comes from the connection string, and the driver falls back to `test` |
   | `NEXTAUTH_URL` | Yes | Base URL, e.g. `http://localhost:3000`. Also used in share links |
   | `NEXTAUTH_SECRET` | Yes | Session signing secret. Generate with `openssl rand -base64 32` |
   | `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD`, `EMAIL_FROM` | For sharing | SMTP settings. Port 465 uses implicit TLS; other ports use STARTTLS |

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production. Both use webpack: the Turbopack build adds an inline script that the Content-Security-Policy blocks |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint over the whole project |
| `npm test` | Run the Jest test suite |
| `npm run test:coverage` | Run the tests with a coverage report |

### Limits

Size limits on stories and AI requests, and the rate limits, are in [`lib/limits.js`](lib/limits.js). Registration is limited per IP address, sign-in per IP address and per email address, and account deletion, share emails and word-usage updates per user. Rate limit counters are kept in MongoDB so they hold across serverless instances.

## Deploying to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your project into Vercel:
   - Visit [Vercel New Project](https://vercel.com/new)
   - Connect to your Git repository
   - Select the repository
   - Add the environment variables from the table above (`MONGODB_URI`, `MONGODB_DB`, `NEXTAUTH_URL` and `NEXTAUTH_SECRET` at least; `EMAIL_*` for sharing) for both Production and Preview
   - Click "Deploy"

   Vercel applies variable changes only to new deployments, so redeploy after adding or changing them. Without `MONGODB_URI`, API routes that need the database return a 503 with code `SERVICE_NOT_CONFIGURED`.
3. Vercel will build the app and provide a URL

The [Production Readiness](docs/PRODUCTION_READY.md) page has a list of checks to run after deploying.

### Continuous Deployment

Vercel deploys each push to the connected repository. Run `npm run lint`, `npm test` and `npm run build` before pushing; CI runs the same checks.

## Learning needs

Each setting changes how the reader looks, and AI stories are also written for it. A story keeps the needs it was made with; a saved story's can be changed in the story library.

| Setting | In the reader | In AI stories |
| --- | --- | --- |
| ADHD | More space between lines; no hints around the page | Short sentences |
| Dyslexia | Wider spacing between letters, words and lines; a softer marker on sight words | Simple words, no tricky spellings |
| Autism | Pages appear without sliding | Literal language, a predictable shape |
| Learning English | Sight words in bold | Simple words, repeated |
| Visual processing | Bigger text and a thicker page outline | One idea per sentence |

## Documentation

Documentation is available in the [docs](docs/) folder:

- **[Quick Start Guide](docs/QUICK_START.md)** - Get up and running locally
- **[API Documentation](docs/API.md)** - Endpoint reference
- **[Production Readiness](docs/PRODUCTION_READY.md)** - What is in place and what remains
- **[Why It's Free](docs/FREE_AND_OPEN.md)** - How the free tier setup works
- **[Illustrations](docs/ILLUSTRATIONS.md)** - How story pictures are drawn
- **[Changelog](docs/CHANGELOG.md)** - Version history and updates

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## Security

Report vulnerabilities privately, as [SECURITY.md](SECURITY.md) describes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app)
- Icons provided by [Lucide React](https://lucide.dev/)
- Built with [Tailwind CSS](https://tailwindcss.com/)
- AI stories use the [Anthropic API](https://docs.anthropic.com/)
