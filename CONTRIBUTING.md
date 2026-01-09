# Contributing to Sight Word Story Generator

Thank you for your interest in contributing to the Sight Word Story Generator! This document provides guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community and the students who will use this tool
- Show empathy towards other community members
- Be patient with questions and feedback

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm, yarn, or pnpm
- MongoDB (local or Atlas account)
- Git

### Setup for Development

1. **Fork the repository**

   ```bash
   # Click the "Fork" button on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/sight-word-story-generator.git
   cd sight-word-story-generator
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   # Copy the example environment file
   cp .env.example .env.local

   # Edit .env.local with your actual values
   # See .env.example for required variables
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Development Workflow

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features (e.g., `feature/pdf-download`)
- `fix/*` - Bug fixes (e.g., `fix/story-generation-bug`)
- `docs/*` - Documentation updates

### Making Changes

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow the coding standards below
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**

   ```bash
   npm run lint        # Check code style
   npm test            # Run tests (when available)
   npm run build       # Ensure build succeeds
   ```

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

   Use [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Maintenance tasks

5. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template
   - Request review from maintainers

## Coding Standards

### JavaScript/React

- Use functional components with hooks
- Follow ESLint configuration (run `npm run lint`)
- Use clear, descriptive variable and function names
- Add JSDoc comments for complex functions
- Avoid deep nesting (max 3 levels)
- Keep functions small and focused (single responsibility)

### Example

```javascript
/**
 * Generate a story using provided sight words
 * @param {Array<string>} words - Sight words to include
 * @param {number} grade - Grade level (0-5)
 * @param {Object} learningNeeds - Learning accommodation flags
 * @returns {Object} - Generated story object
 */
export const generateStory = (words, grade, learningNeeds) => {
  // Implementation
};
```

### File Organization

```text
components/
  ├── ComponentName.js        # Component implementation
  ├── ComponentName.test.js   # Component tests (future)
  └── index.js                # Re-exports (if needed)

pages/
  ├── api/                    # API routes
  └── [page].js               # Page components

lib/
  └── utility.js              # Shared utilities

models/
  └── Model.js                # Mongoose schemas
```

### CSS/Styling

- Use Tailwind CSS utility classes
- Keep custom CSS in `styles/globals.css`
- Use CSS modules for component-specific styles if needed
- Follow BEM naming if custom classes are necessary

### Accessibility

- Use semantic HTML elements
- Include proper ARIA labels
- Ensure keyboard navigation works
- Maintain color contrast ratios (WCAG AA)
- Test with screen readers when possible

## Testing

### Writing Tests

(Tests framework TBD - will use Jest + React Testing Library)

```javascript
// Example test structure
describe('StoryGenerator', () => {
  it('should generate a story with provided words', () => {
    const words = ['cat', 'dog', 'run'];
    const story = generateStory(words, 1, {});

    expect(story.content).toBeDefined();
    expect(story.usedWords).toEqual(words);
  });
});
```

### Running Tests

```bash
npm test              # Run all tests
npm test -- --watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## Submitting Changes

### Pull Request Process

1. **Ensure your PR**:
   - Has a clear, descriptive title
   - References any related issues (e.g., "Fixes #123")
   - Includes a description of changes
   - Has passing tests (when test suite exists)
   - Has been manually tested
   - Updates documentation if needed

2. **PR Template**:

   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Tested locally
   - [ ] Added/updated tests
   - [ ] All existing tests pass

   ## Checklist
   - [ ] Code follows project style guidelines
   - [ ] Self-reviewed code
   - [ ] Commented complex code sections
   - [ ] Updated documentation
   - [ ] No new warnings
   ```

3. **Review Process**:
   - Maintainers will review within 3-5 business days
   - Address any requested changes
   - Once approved, maintainers will merge

## Reporting Bugs

### Before Reporting

- Check if the issue already exists
- Try to reproduce on latest version
- Gather relevant information (browser, OS, steps to reproduce)

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - OS: [e.g., Windows 10, macOS 12]
 - Browser: [e.g., Chrome 96, Safari 15]
 - Version: [e.g., 0.1.0]

**Additional context**
Any other relevant information.
```

## Suggesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions or features you've considered.

**Additional context**
Any other context, screenshots, or examples.

**Educational Impact**
How will this help teachers and students?
```

## Areas We Need Help

- 📝 Documentation improvements
- 🧪 Writing tests
- 🎨 UI/UX enhancements
- ♿ Accessibility improvements
- 🌍 Internationalization (i18n)
- 🐛 Bug fixes
- ✨ New learning accommodation features

## Questions?

- Open a GitHub Discussion
- Email: [contact information]
- Check existing issues and pull requests

## Recognition

Contributors will be acknowledged in:

- README.md
- Release notes
- Project website (future)

Thank you for helping make learning to read more accessible! 📚✨
