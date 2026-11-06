# Quick Start Guide

How to run Sight Word Stories on your own machine.

---

## Prerequisites

- Node.js 24 (the version in `engines` in `package.json`, which CI and Vercel also use)
- npm (comes with Node.js)
- A MongoDB database, for example the free tier of [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

## Step 1: Clone and install

```bash
git clone https://github.com/ces0491/sight-word-app.git
cd sight-word-app
npm install
```

---

## Step 2: Environment

```bash
cp .env.example .env.local
```

Then edit `.env.local`. It is listed in `.gitignore`; never commit it.

### Required variables

```bash
# MongoDB connection string, from the Atlas dashboard
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/
# The database inside the cluster that the app uses
MONGODB_DB=sight-word-stories

# The app's base URL
NEXTAUTH_URL=http://localhost:3000

# A random secret: generate one with  openssl rand -base64 32
NEXTAUTH_SECRET=<generated-secret>
```

### Optional variables

```bash
# Email, only needed for sharing stories by email
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM="Sight Word Stories <your-email@gmail.com>"
```

AI stories need no variable. A signed-in grown-up adds their own Anthropic API key under Grown-ups → Account, and Anthropic bills their account.

---

## Step 3: Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). From there:

1. **Make a story**: tap **Try some words**, then **Make my story**.
2. **Choose words**: tap **Grown-ups**, answer the sum, and type words or pick them from the Dolch lists.
3. **Create an account**: under Grown-ups → Account, tap **Sign in**, then **Create one**.
4. **Save a story**: tap **Save** on the last page of a story. Saved stories are in the story library.

---

## Common Issues

### MongoDB connection failed

Check `MONGODB_URI` in `.env.local`: the username and password, and that Atlas allows connections from your IP address.

### Sign-in errors

Make sure `NEXTAUTH_SECRET` is set. Generate one with `openssl rand -base64 32`.

### Email sharing not working

Expected until SMTP is configured. Without the `EMAIL_*` variables the app says email sharing isn't set up; see [.env.example](../.env.example).

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
components/   React components: storybook/ (the child-facing screens), story/, auth/, analytics/
hooks/        React hooks (speech, toasts, sign-in, unsaved changes)
lib/          Story engine, word matching, illustrations, OCR, validation, AI stories
models/       Mongoose schemas: User, Story, WordAnalytics, RateLimit
pages/        Next.js pages; pages/api/ holds the API routes
public/       Static files
styles/       Global CSS and the learning-needs styles
test/         API route tests and test helpers
```

---

## Deploying

The [README](../README.md#deploying-to-vercel) covers deploying to Vercel, and [Production Readiness](PRODUCTION_READY.md) lists what is in place, the known gaps, and checks to run after deploying.

## More Documentation

- [README](../README.md): project overview
- [API documentation](API.md)
- [Contributing](../CONTRIBUTING.md)
- [Security policy](../SECURITY.md)

Questions and bug reports go in [GitHub issues](https://github.com/ces0491/sight-word-app/issues).

The project is licensed under the MIT License; see [LICENSE](../LICENSE).
