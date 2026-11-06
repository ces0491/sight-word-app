# Sight Word Stories

Short illustrated stories built from the sight words a child is learning, to read together. A grown-up picks the words; the child taps them to hear them, reads the story a page at a time, and finishes with a word hunt.

[Sight Word Stories](https://sight-word-app.vercel.app/)

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

- **Words to practise**: type them, upload a list, scan a page (OCR picks out the words that are on the Dolch lists), or pick from the Dolch sight word lists by level
- **Two story makers**:
  - **Classic** builds a day-in-the-life story from written scenes, in the browser. Free, and no account needed.
  - **AI** writes a story with Claude Haiku 4.5, using the grown-up's own Anthropic API key. They sign in and add the key under Account, and Anthropic bills their account for each story. The key is kept in that browser, removed on sign-out, and sent from the browser straight to Anthropic, so this app's server never receives it. If AI generation fails, the app falls back to Classic.
- **Reading level** from Kindergarten to Grade 3, the span of the Dolch lists. AI stories are written for it; Classic stories are the same at every level and save it as a label for sorting the library.
- **Sight word style** (highlighted, bold, underlined or plain) and pictures on or off
- **Learning needs**: settings that change how a story reads (below)
- **Save, share and print**: save stories to an account, email a link (needs SMTP settings), print every page, and manage saved stories in the story library

## Cost

Classic mode, the SVG illustrations, the MongoDB Atlas free tier and Vercel's free tier have no running cost. Email sharing works with a free Gmail account and an app password. AI stories are billed to each grown-up's own Anthropic account at Claude Haiku 4.5 rates, with output capped at 1,024 tokens a story, so they cost whoever runs the site nothing.

👉 **[Read why & how we keep it free →](docs/FREE_AND_OPEN.md)**

## Getting Started

### Prerequisites

- Node.js 20 or later (CI uses Node 24)
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
| `npm run build` | Lint, type-check and build for production |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Jest test suite |
| `npm run test:coverage` | Run the tests with a coverage report |

### Limits

Size limits on stories and AI requests, and the per-user rate limit on share emails, are in [`lib/limits.js`](lib/limits.js). Rate limit counters are kept in MongoDB so they hold across serverless instances.

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

Vercel automatically deploys changes when you push to your repository. To ensure smooth deployments:

- Run `npm run lint`, `npm test` and `npm run build` before pushing (CI runs the same checks)
- Use the Vercel CLI for previewing production builds locally
- Set up environment variables in the Vercel project settings

## Learning needs

Each setting changes how the reader looks, and AI stories are also written for it.

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

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a Pull Request.

## Security

For security concerns, please review our [Security Policy](SECURITY.md) for reporting vulnerabilities.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app)
- Icons provided by [Lucide React](https://lucide.dev/)
- Built with [Tailwind CSS](https://tailwindcss.com/)
- AI stories use the [Anthropic API](https://docs.anthropic.com/)
