# Sight Word Story Generator

A free educational web application that helps teachers create custom stories featuring sight words for early readers, with adaptations for students with different learning needs.

[Sight Word Story Generator](https://sight-word-app.vercel.app/)

**Status**: see the [Production Readiness](docs/PRODUCTION_READY.md) page for what is in place and what remains before a public launch.

---

## Features

- **Two story engines**:
  - **Classic** builds stories from pre-written scenes, in the browser. Free, and no account needed.
  - **AI** writes a story with Claude Haiku 4.5. It needs a signed-in account and `ANTHROPIC_API_KEY`, and each story is billed by Anthropic. If AI generation fails, the app falls back to Classic.
- **Multiple Input Methods**: Add words manually, upload word lists, or use image recognition (OCR)
- **Learning Accommodations**: Tailor stories for students with ADHD, dyslexia, autism, ESL needs, and visual processing differences
- **Visual Supports**: An SVG illustration for each sentence, with the same characters on every page and settings that follow the story (bedroom, kitchen, park, classroom and more)
- **Format Options**: Display sight words as highlighted, bold, or underlined text
- **Save & Share**: Save stories to your account and email a share link to students or colleagues (needs SMTP settings)
- **Printable Format**: Print stories for classroom use

## Cost

Classic mode, the SVG illustrations, the MongoDB Atlas free tier and Vercel's free tier have no running cost. Email sharing works with a free Gmail account and an app password. AI mode is optional and billed per request at Anthropic's Claude Haiku 4.5 rates; leave `ANTHROPIC_API_KEY` unset to turn it off.

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
   | `NEXTAUTH_URL` | Yes | Base URL, e.g. `http://localhost:3000`. Also used in share links |
   | `NEXTAUTH_SECRET` | Yes | Session signing secret. Generate with `openssl rand -base64 32` |
   | `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD`, `EMAIL_FROM` | For sharing | SMTP settings. Port 465 uses implicit TLS; other ports use STARTTLS |
   | `ANTHROPIC_API_KEY` | For AI mode | Anthropic API key. Without it, AI mode is unavailable and Classic mode still works |

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

Size limits on stories and AI requests, and the per-user rate limits on AI generation and share emails, are in [`lib/limits.js`](lib/limits.js). Rate limit counters are kept in MongoDB so they hold across serverless instances.

## Deploying to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your project into Vercel:
   - Visit [Vercel New Project](https://vercel.com/new)
   - Connect to your Git repository
   - Select the repository
   - Add the environment variables from the table above (`MONGODB_URI`, `NEXTAUTH_URL` and `NEXTAUTH_SECRET` at least; `EMAIL_*` for sharing; `ANTHROPIC_API_KEY` for AI mode)
   - Click "Deploy"
3. Vercel will build the app and provide a URL

The [Production Readiness](docs/PRODUCTION_READY.md) page has a list of checks to run after deploying.

### Continuous Deployment

Vercel automatically deploys changes when you push to your repository. To ensure smooth deployments:

- Run `npm run lint`, `npm test` and `npm run build` before pushing (CI runs the same checks)
- Use the Vercel CLI for previewing production builds locally
- Set up environment variables in the Vercel project settings

## Learning Considerations

The application provides specialized accommodations for different learning needs:

### ADHD Considerations

- Shorter, more focused story segments
- High-contrast visual formatting of target words
- Reduced visual distractions in the UI
- More frequent visual supports

### Dyslexia Considerations

- Increased spacing between words and lines
- Optional dyslexia-friendly font (Comic Neue)
- Multiple encoding options (visual + textual cues)
- Color highlighting for better word recognition

### Autism Spectrum Considerations

- Predictable story structures
- Clear visual supports
- Concrete language
- Consistent formatting

### ESL Considerations

- Simplified sentence structures
- Visual supports paired with text
- Key vocabulary emphasis
- Optional translations for sight words

### Visual Processing Considerations

- High contrast text/background
- Larger text size option
- Clean, uncluttered layout
- Strategic word highlighting

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
