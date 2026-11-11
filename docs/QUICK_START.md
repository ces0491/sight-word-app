# Quick Start Guide

How to run Sight Word Stories on your own machine.

---

## Prerequisites

- Node.js 24 (the version in `engines` in `package.json`, which CI and Vercel also use)
- npm (comes with Node.js)

The app has no database and needs no environment variables.

---

## Step 1: Clone and install

```bash
git clone https://github.com/ces0491/sight-word-app.git
cd sight-word-app
npm install
```

---

## Step 2: Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). From there:

1. **Make a story**: tap **Try some words**, then **Make my story**.
2. **Choose words**: tap **Grown-ups**, answer the sum, and type words or pick them from the Dolch lists.
3. **Save a story**: tap **Save** on the last page of a story. Saved stories are kept in this browser, in the story library.
4. **Share a story**: tap **Share** on the last page and copy the link. Open it in a private window to see what someone else gets.
5. **Try AI stories**: add your own Anthropic API key under Grown-ups → AI stories, then choose **AI** under Story maker. The key is saved in the browser, so use one made just for the app that expires, in a workspace with a low monthly spend limit. The notice above the key field explains why.

---

## Common Issues

### Saved stories disappeared

They're kept in the browser that saved them, for this address. A different browser, a private window, `127.0.0.1` in place of `localhost`, or clearing site data each start with an empty library.

### A share link says it's damaged

The story is in the part of the link after `#`. Some apps cut long links short; copy the whole link again.

### Port 3000 already in use

```bash
npx next dev -p 3001
```

---

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint over the whole project |
| `npm test` | Run the Jest test suite |
| `npm run test:coverage` | Run the tests with a coverage report |

---

## Project Structure

```text
components/   React components: storybook/ (the child-facing screens) and story/ (editor, sharing, story text)
hooks/        React hooks (speech, toasts, the saved stories, unsaved changes)
lib/          Story engine, word matching, illustrations, OCR, the story library, share links, AI stories
pages/        Next.js pages
public/       Static files
styles/       Global CSS and the learning-needs styles
test/         Page tests and test helpers
```

---

## Deploying

The [README](../README.md#deploying-to-vercel) covers deploying to Vercel, and [Production Readiness](PRODUCTION_READY.md) lists what is in place, the known gaps, and checks to run after deploying.

## More Documentation

- [README](../README.md): project overview
- [Contributing](../CONTRIBUTING.md)
- [Security policy](../SECURITY.md)

Questions and bug reports go in [GitHub issues](https://github.com/ces0491/sight-word-app/issues).

The project is licensed under the MIT License; see [LICENSE](../LICENSE).
