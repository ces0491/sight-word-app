# Sight Word Story Generator

A **100% FREE** educational web application that helps teachers create custom stories featuring sight words for early readers. Perfect for students with different learning needs.

**✨ No subscriptions • No API costs • No hidden fees ✨**

[Sight Word Story Generator](https://sight-word-app.vercel.app/)

## Why It's Free

This tool is designed for teachers and is **completely free** to use:

- 💰 **No API Costs** - Uses SVG illustrations instead of paid AI image services
- 🎨 **Child-Friendly Illustrations** - Simple, colorful SVG graphics perfect for early readers
- 🚀 **Free Hosting** - Runs on Vercel's free tier
- 🗄️ **Free Database** - Uses MongoDB Atlas free tier (512MB)
- 📧 **Optional Email** - Email sharing works with free Gmail accounts
- ♾️ **Unlimited Use** - Create as many stories as you need!

**Our Mission**: Make quality educational tools accessible to all teachers, regardless of budget.

👉 **[Read why & how we keep it free →](FREE_AND_OPEN.md)**

## Features

- **Custom Story Generation**: Create personalized stories featuring specific sight words
- **Multiple Input Methods**: Add words manually, upload word lists, or use image recognition (OCR)
- **Learning Accommodations**: Tailor stories for students with ADHD, dyslexia, autism, ESL needs, and visual processing differences
- **Visual Supports**: Automatically generates SVG illustrations for each story sentence
- **Format Options**: Display sight words as highlighted, bold, or underlined text
- **Save & Share**: Store your generated stories and share them with students or colleagues
- **Printable Format**: Print stories for classroom use

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm, yarn, or pnpm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ces0491/sight-word-app.git
   cd sight-word-story-generator
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   # Copy the example file
   cp .env.example .env.local

   # Edit .env.local with your values:
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

   **Note**: Uses FREE MongoDB Atlas tier and FREE Vercel hosting. No paid APIs needed!

4. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploying to Vercel

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your project into Vercel:
   - Visit [Vercel New Project](https://vercel.com/new)
   - Connect to your Git repository
   - Select the sight-word-story-generator repository
   - Configure project settings:
     - Add the required environment variables (MONGODB_URI, NEXTAUTH_SECRET)
     - Optional: Add EMAIL_* variables if you want email sharing
     - Customize the project name if desired
   - Click "Deploy"

3. Vercel will automatically deploy your app and provide a URL

### Continuous Deployment

Vercel automatically deploys changes when you push to your repository. To ensure smooth deployments:

- Test changes locally before pushing
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

Comprehensive documentation is available in the [docs](docs/) folder:

- **[Quick Start Guide](docs/QUICK_START.md)** - Get up and running in 5 minutes
- **[API Documentation](docs/API.md)** - Complete API reference
- **[Why It's Free](docs/FREE_AND_OPEN.md)** - How we keep this 100% free
- **[SVG Enhancements](docs/SVG_ENHANCEMENT_SUMMARY.md)** - Dynamic illustration system
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
