# Contributing to Sight Word Stories

Thanks for helping with Sight Word Stories.

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

Contributors are expected to:

- Be respectful and inclusive
- Help newcomers learn
- Put the children and grown-ups who use the app first
- Be patient with questions and feedback

## Getting Started

### Prerequisites

- Node.js 24 (the version in `engines` in `package.json`)
- npm
- MongoDB (local or Atlas account)
- Git

### Setup for Development

1. **Fork the repository**

   ```bash
   # Click the "Fork" button on GitHub, then clone your fork
   git clone https://github.com/<your-username>/sight-word-app.git
   cd sight-word-app
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

- `main` - the deployed branch; Vercel deploys it
- `feat/*` - New features (e.g., `feat/own-api-keys`)
- `fix/*` - Bug fixes (e.g., `fix/story-generation-bug`)
- `docs/*` - Documentation updates

Branches start from `main`, and pull requests go back into it.

### Making Changes

1. **Create a feature branch**

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow the coding standards below
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**

   ```bash
   npm run lint        # Check code style
   npm test            # Run the Jest suite
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
   git push origin feat/your-feature-name
   ```

6. **Create a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Say what changed and why, and how you tested it
   - Request review from the maintainer

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
 * @param {number} grade - Reading level (0-3)
 * @param {Object} learningNeeds - Learning accommodation flags
 * @returns {Object} - Generated story object
 */
export const generateStory = (words, grade, learningNeeds) => {
  // Implementation
};
```

### File Organization

See [Project Structure](docs/QUICK_START.md#project-structure) in the Quick Start Guide.

### CSS/Styling

- Use Tailwind CSS utility classes. The palette, fonts and cut-out shadows are the `@theme` block at the top of `styles/globals.css`
- Custom CSS goes in `styles/globals.css`; the learning-needs rules are in `styles/learningAdaptations.css`

### Accessibility

- Use semantic HTML elements
- Include proper ARIA labels
- Ensure keyboard navigation works
- Maintain color contrast ratios (WCAG AA)
- Test with screen readers when possible

## Testing

### Writing Tests

Tests use Jest and React Testing Library, and go in:

- `lib/__tests__/` for library functions
- `components/__tests__/` for components
- `test/api/` for API routes (not under `pages/`, where Next.js would treat them as routes)

API route tests mock the database, session and external services; [`test/apiTestUtils.js`](test/apiTestUtils.js) has request and response stand-ins. Add `/** @jest-environment node */` at the top of server-side tests.

```javascript
import { findUsedWords } from '../sightWords';

describe('findUsedWords', () => {
  it('returns the sight words that appear in the story', () => {
    expect(findUsedWords(['The dog ran.'], ['dog', 'cat'])).toEqual(['dog']);
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
   - Has passing tests
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
   - The maintainer reviews the PR and may ask for changes
   - Once approved, the maintainer merges it

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
 - Browser: [e.g., Chrome 130, Safari 18]
 - Version: [e.g., 1.1.0]

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

- Documentation
- Tests
- UI and UX
- Accessibility
- Translations
- Bug fixes
- New learning-needs settings

## Questions?

- Open a [GitHub issue](https://github.com/ces0491/sight-word-app/issues)
- Check existing issues and pull requests
