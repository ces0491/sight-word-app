# Quick Start Guide

## Sight Word Story Generator

Get your development environment up and running in 5 minutes!

---

## Prerequisites

- Node.js 16.x or higher
- npm (comes with Node.js)
- MongoDB account (free tier at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas))

---

## Step 1: Clone & Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/ces0491/sight-word-app.git
cd sight-word-story-generator

# Install dependencies
npm install
```

---

## Step 2: Environment Setup (3 minutes)

```bash
# Copy the example environment file
cp .env.example .env.local
```

**Edit `.env.local`** with your actual values:

### Required Variables

```bash
# 1. MongoDB (REQUIRED)
# Get from: https://cloud.mongodb.com/
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/

# 2. NextAuth (REQUIRED)
# Use your local or production URL
NEXTAUTH_URL=http://localhost:3000

# Generate a secret with: openssl rand -base64 32
NEXTAUTH_SECRET=your-32-character-secret-here
```

### Optional Variables

```bash
# 3. Email (OPTIONAL - only needed for story sharing)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM="Sight Word Stories <your-email@gmail.com>"
```

---

## Step 3: Run the App (30 seconds)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

---

## 🎉 You're Done

The app should now be running. You can:

1. **Register a new account** - Click "Sign Up"
2. **Create a story** - Enter sight words and click "Generate Story"
3. **View analytics** - See word usage statistics (requires login)
4. **Save stories** - Save your favorite stories (requires login)

---

## Common Issues & Solutions

### Issue: "MongoDB connection failed"

**Solution**: Check your `MONGODB_URI` in `.env.local`

- Make sure your IP is whitelisted in MongoDB Atlas
- Verify username and password are correct
- Test connection in MongoDB Compass

### Issue: "NextAuth error"

**Solution**: Make sure `NEXTAUTH_SECRET` is set

```bash
# Generate a new secret
openssl rand -base64 32
```

### Issue: "Email sharing not working"

**Solution**: This is normal if you haven't configured SMTP

- Email configuration is optional
- App will show "Email service not configured" message
- See [.env.example](.env.example) for setup instructions

### Issue: Port 3000 already in use

**Solution**: Use a different port

```bash
PORT=3001 npm run dev
```

---

## Next Steps

### For Development

1. **Read the docs**:
   - [API.md](API.md) - API endpoint documentation
   - [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute
   - [SECURITY.md](SECURITY.md) - Security policies

2. **Explore the code**:
   - `pages/` - Next.js pages and API routes
   - `components/` - React components
   - `lib/` - Utility functions
   - `models/` - Database schemas

3. **Make changes**:
   - Follow coding standards in [CONTRIBUTING.md](CONTRIBUTING.md)
   - Test your changes locally
   - Create a pull request

### For Production Deployment

1. **Set up MongoDB Atlas**
   - Create a production cluster
   - Enable backups
   - Whitelist Vercel IPs

2. **Deploy to Vercel**
   - Connect your GitHub repository
   - Add environment variables
   - Deploy!

3. **Configure email** (optional)
   - Set up SMTP service (Gmail, SendGrid, etc.)
   - Add credentials to Vercel environment

4. **Set up monitoring**
   - Enable Vercel Analytics
   - Add Sentry for error tracking
   - Monitor MongoDB performance

---

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run tests (when available)
npm test
```

---

## Project Structure

```text
sight-word-story-generator/
├── components/          # React components
│   ├── analytics/      # Analytics dashboard
│   ├── auth/          # Authentication components
│   ├── story/         # Story-related components
│   ├── Toast.js       # Toast notifications
│   └── ...
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
│   ├── dbConnect.js   # MongoDB connection
│   ├── storyGeneration.js  # Story generation logic
│   └── ...
├── models/            # Mongoose schemas
│   ├── User.js
│   ├── Story.js
│   └── WordAnalytics.js
├── pages/             # Next.js pages
│   ├── api/          # API routes
│   ├── index.js      # Home page
│   └── _app.js       # App wrapper
├── public/            # Static files
├── styles/            # CSS files
├── .env.example       # Environment template
└── README.md          # Project overview
```

---

## Feature Overview

### ✅ Working Features

- **User Authentication** - Sign up, login, logout
- **Story Generation** - AI-powered story creation
- **SVG Illustrations** - Automatic scene generation
- **Learning Accommodations** - ADHD, Dyslexia, Autism, ESL, Visual Processing
- **Word Formats** - Highlighted, Bold, Underlined, Normal
- **Save Stories** - Store stories in database
- **Analytics Dashboard** - Track word usage
- **OCR Upload** - Extract words from images
- **Print Stories** - Print-friendly format

### ⚠️ Partial Features

- **Email Sharing** - Requires SMTP configuration (optional)
- **PDF Download** - Coming soon (shows notification)

---

## Getting Help

### Documentation

- [README.md](README.md) - Project overview
- [API.md](API.md) - API documentation
- [CONTRIBUTING.md](CONTRIBUTING.md) - Development guide
- [PRODUCTION_READINESS_REPORT.md](PRODUCTION_READINESS_REPORT.md) - Production status

### Support

- **Issues**: [GitHub Issues](https://github.com/ces0491/sight-word-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ces0491/sight-word-app/discussions)
- **Email**: [Your contact email]

### Community

- Star the repo if you find it useful!
- Share with teacher friends
- Contribute improvements

---

## Tips for Success

1. **Start Small**: Create a simple story first
2. **Explore Features**: Try different learning accommodations
3. **Check Analytics**: See your word usage patterns
4. **Save Favorites**: Build a library of stories
5. **Share Feedback**: Help us improve!

---

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

---

**Happy Story Creating! 📚✨**

Last Updated: 2026-01-09
