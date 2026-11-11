# Sight Word Stories

Short illustrated stories built from the sight words a child is learning, to read together. A grown-up picks the words; the child taps them to hear them, reads the story a page at a time, and finishes with a word hunt.

[Sight Word Stories](https://sightwords.sheetsolved.com/)

**Status**: not ready for a public launch yet. [SCOPE.md](SCOPE.md) sets what a launch needs, and the [Production Readiness](docs/PRODUCTION_READY.md) page lists what is in place and what remains.

---

## Features

**Story time, for the child**

- **Word cards**: the words to practise as big cards; tap one to hear it
- **One page at a time**: a large picture, large text in [Andika](https://software.sil.org/andika/) (a typeface made for beginning readers), and Back and Next buttons (or the arrow keys)
- **Read-aloud**: tap any word to hear it, or "Read to me" to hear the page with each word lit up as it's spoken. Uses the browser's built-in speech, so it's free; the voice depends on the device
- **Word hunt**: after the story, hear a word and find its card, earning a star for each
- **Pictures that follow the story**: the same characters on every page, in a setting that matches the sentence (bedroom, kitchen, park, classroom and more)

**Grown-ups, behind a simple sum**

- **Words to practise**: type them, upload a list, scan a page, or pick from the Dolch sight word lists by level. A story takes up to 100 words. Scanning picks out the words on the Dolch lists that it reads exactly; others can be typed
- **Stories that use the words**: a Classic story uses each Dolch word on its own, and as many of a longer list as its scenes and up to ten extra sentences allow. The word hunt and highlights use only the words that are on the page
- **Two story makers**:
  - **Classic** builds a day-in-the-life story from written scenes, in the browser, for free.
  - **AI** writes a story with Claude Haiku 4.5, using the grown-up's own Anthropic API key, added under AI stories. Anthropic bills their account for each story. The key stays in that browser until it's removed, and goes from the browser straight to Anthropic. Above the key field, the app says so, says who else could use the key, and suggests a key just for the app that expires, made in a workspace with a low monthly spend limit. If AI generation fails, the app falls back to Classic.
- **Reading level** from Kindergarten to Grade 3, the span of the Dolch lists. AI stories are written for it; Classic stories are the same at every level and save it as a label for sorting the library.
- **Sight word style** (highlighted, bold, underlined or plain) and pictures on or off
- **Learning needs**: settings that change how a story reads (below)
- **Save, share and print**: save stories to the browser's story library and edit or delete them there, share a story as a link that carries the story itself, and print every page. A share link opens on any device, and the story can be saved there too
- **No accounts**: there's no sign-in and no database. Nothing a grown-up makes leaves their browser unless they share it or make an AI story. [Accounts (removed)](docs/ACCOUNTS.md) records the version with accounts and where it was heading
- **Kept on a reload**: the words, settings and newest unsaved story stay for the browser tab; the story editor asks before leaving with unsaved changes

## Cost

The app is static pages with no database or server code, so Classic mode, the SVG illustrations and Vercel's free tier have no running cost. AI stories are billed to each grown-up's own Anthropic account at Claude Haiku 4.5 rates, with output capped at 1,024 tokens a story, so they cost whoever runs the site nothing. More in [Why It's Free](docs/FREE_AND_OPEN.md).

## Browser support

The styles use Tailwind CSS 4, which needs Safari 16.4, Chrome 111, Firefox 128 or newer. In older browsers, such as on iPads that can't update past iPadOS 15, pages won't look right.

## Getting Started

### Prerequisites

- Node.js 24 (set in `engines` in `package.json`; CI and Vercel use it too)
- npm

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

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

The app needs no environment variables.

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

Size limits on stories and AI requests are in [`lib/limits.js`](lib/limits.js). The story editor, the story library and share links all check against them.

## Deploying to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your project into Vercel:
   - Visit [Vercel New Project](https://vercel.com/new)
   - Connect to your Git repository
   - Select the repository
   - Click "Deploy". No environment variables are needed
3. Vercel will build the app and provide a URL
4. To serve it on your own domain, add the domain in Vercel. Vercel goes on serving the generated `*.vercel.app` alias too, so `next.config.js` redirects this deployment's alias, `sight-word-app.vercel.app`, to `sightwords.sheetsolved.com`. Change that rule for your own deployment.

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
- **[Production Readiness](docs/PRODUCTION_READY.md)** - What is in place and what remains
- **[Why It's Free](docs/FREE_AND_OPEN.md)** - How the free tier setup works
- **[Illustrations](docs/ILLUSTRATIONS.md)** - How story pictures are drawn
- **[Accounts (removed)](docs/ACCOUNTS.md)** - The version with accounts and a database, and where it was heading
- **[Changelog](docs/CHANGELOG.md)** - Version history and updates

## Privacy

The app's [privacy page](https://sightwords.sheetsolved.com/privacy) says what it keeps, where that goes and how to remove it. It lives in [`pages/privacy.js`](pages/privacy.js): update it, and its date, when the app starts keeping something new or using another service. [`test/pages/privacy.test.js`](test/pages/privacy.test.js) fails if the Content-Security-Policy allows an outside host the page doesn't name.

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
