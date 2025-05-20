# Sight Word Story Generator

An educational web application that helps teachers create custom stories featuring sight words for early readers. The application is especially valuable for students with different learning needs.

[Sight Word Story Generator](https://sight-word-app.vercel.app/)

## Features

- **Custom Story Generation**: Create personalized stories featuring specific sight words
- **Multiple Input Methods**: Add words manually, upload word lists, or use image recognition (OCR)
- **Learning Accommodations**: Tailor stories for students with ADHD, dyslexia, autism, ESL needs, and visual processing differences
- **Visual Supports**: Automatically generates illustrations for each story sentence
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
   ```
   # Create a .env.local file with:
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   OPENAI_API_KEY=your_openai_api_key (for AI image generation)
   ```

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
     - Add the required environment variables (MONGODB_URI, NEXTAUTH_SECRET, OPENAI_API_KEY)
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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app)
- Icons provided by [Lucide React](https://lucide.dev/)
- Built with [Tailwind CSS](https://tailwindcss.com/)