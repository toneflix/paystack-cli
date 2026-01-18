# Contributing

Thank you for your interest in contributing to Paystack CLI! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

Before creating a bug report:

1. Check [existing issues](https://github.com/toneflix/paystack-cli/issues) to avoid duplicates
2. Use the latest version of the CLI
3. Collect relevant information (error messages, environment details)

**Creating a Bug Report**:

1. Open a new issue on GitHub
2. Use a clear and descriptive title
3. Provide detailed steps to reproduce
4. Include expected vs. actual behavior
5. Add environment information:
   - OS and version
   - Node.js version
   - CLI version
   - Relevant logs (remove sensitive data)

Example bug report:

```markdown
## Bug Description

Transaction initialization fails with "Invalid email" error even with valid email

## Steps to Reproduce

1. Run: paystack-cli transaction:initialize --email=user@example.com --amount=50000
2. Observe error message

## Expected Behavior

Transaction should initialize successfully

## Actual Behavior

Error: "Invalid email address"

## Environment

- OS: macOS 13.5
- Node: v18.17.0
- CLI: v1.0.0
```

### Suggesting Enhancements

Enhancement suggestions are welcome! To suggest a feature:

1. Check if the feature already exists or is planned
2. Open an issue with the `enhancement` label
3. Provide:
   - Clear description of the feature
   - Use cases and benefits
   - Potential implementation approach
   - Examples of similar features in other tools

### Pull Requests

We actively welcome your pull requests:

1. **Fork the repository** and create your branch from `main`
2. **Make your changes**:
   - Follow the code style guidelines
   - Add tests for new features
   - Update documentation
3. **Test your changes**:
   - Run all tests: `pnpm test`
   - Test manually with real commands
4. **Commit your changes**:
   - Use clear commit messages
   - Follow commit message conventions
5. **Push to your fork** and submit a pull request
6. **Respond to feedback** during code review

## Development Setup

### Prerequisites

- Node.js 18 or higher
- pnpm package manager
- Git

### Setting Up

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/paystack-cli.git
cd paystack-cli

# 2. Install dependencies
pnpm install

# 3. Build the project
pnpm run build

# 4. Link for local testing
pnpm link --global

# 5. Test your installation
paystack-cli --version
```

## Development Workflow

### Branch Naming

Use descriptive branch names:

- `feature/add-new-command` - New features
- `fix/transaction-error` - Bug fixes
- `docs/update-readme` - Documentation updates
- `refactor/improve-error-handling` - Code refactoring
- `test/add-integration-tests` - Test additions

### Coding Standards

#### TypeScript

- Use TypeScript strict mode
- Define explicit types for public APIs
- Prefer interfaces over type aliases for objects
- Use const over let where possible

```typescript
// ✓ Good
interface TransactionData {
  email: string;
  amount: number;
}

const initializeTransaction = async (
  data: TransactionData,
): Promise<Response> => {
  // Implementation
};

// ✗ Avoid
const initializeTransaction = async (data: any) => {
  // Implementation
};
```

#### Naming Conventions

- **Classes**: PascalCase (`TransactionCommand`)
- **Files**: PascalCase for classes, camelCase for utilities
- **Variables/Functions**: camelCase (`processPayment`)
- **Constants**: UPPER_SNAKE_CASE (`API_VERSION`)
- **Private members**: Prefix with underscore (`_internalMethod`)

#### Command Structure

New commands should follow this pattern:

```typescript
import { Command } from 'h3ravel-musket';
import paystack from '../Paystack';
import { output } from '../helpers';

export default class MyCommand extends Command {
  // Command signature with arguments and options
  static signature = 'resource:action {argument?} {--option=}';

  // Brief description shown in help
  static description = 'Description of what this command does';

  async handle() {
    // Get arguments and options
    const argument = this.argument('argument');
    const option = this.option('option');

    try {
      // Make API call
      const response = await paystack.api.someEndpoint({
        argument,
        option,
      });

      // Output result
      output(response.data, this.json);
    } catch (error) {
      // Handle errors gracefully
      this.error('User-friendly error message');
      throw error;
    }
  }
}
```

#### Error Handling

Always use try-catch blocks and provide helpful error messages:

```typescript
try {
  const response = await paystack.api.transfer({
    amount,
    recipient,
  });
  output(response.data, this.json);
} catch (error) {
  if (error.response?.status === 401) {
    this.error('Authentication failed. Please run: paystack-cli login');
  } else if (error.response?.status === 400) {
    this.error(`Invalid request: ${error.response.data.message}`);
  } else {
    this.error('An error occurred. Please try again.');
  }
  throw error;
}
```

### Testing

#### Writing Tests

Create tests in `src/__tests__/`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import MyCommand from '../Commands/MyCommand';

describe('MyCommand', () => {
  beforeEach(() => {
    // Setup
  });

  it('should handle valid input', async () => {
    const command = new MyCommand();
    // Test implementation
    expect(command).toBeDefined();
  });

  it('should reject invalid input', async () => {
    // Test error cases
  });
});
```

#### Running Tests

```bash
# Run all tests
pnpm test

# Watch mode for development
pnpm test:watch

# Coverage report
pnpm test:coverage

# Run specific test file
pnpm test MyCommand.test.ts
```

### Documentation

Update documentation when making changes:

#### Code Documentation

Use JSDoc comments for public APIs:

```typescript
/**
 * Initialize a new transaction
 * @param email - Customer email address
 * @param amount - Amount in kobo (smallest currency unit)
 * @param options - Additional transaction options
 * @returns Promise resolving to transaction response
 */
async initializeTransaction(
  email: string,
  amount: number,
  options?: TransactionOptions
): Promise<TransactionResponse> {
  // Implementation
}
```

#### README Updates

- Add new commands to the command list
- Update examples if behavior changes
- Add new sections for significant features

#### VitePress Documentation

Update relevant pages in `/docs/`:

- Guide pages for new features
- API reference for new endpoints
- Examples for new workflows

### Commit Messages

Follow conventional commit format:

```sh
type(scope): subject

body

footer
```

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic changes)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:

```sh
feat(transaction): add support for split payments

Added --subaccount option to transaction:initialize command
to enable split payment functionality

Closes #123

fix(webhook): resolve signature verification issue

Updated signature calculation to match Paystack's current implementation

docs(readme): update installation instructions

Added pnpm installation method and troubleshooting section
```

## Pull Request Process

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] Commit messages are clear and descriptive
- [ ] No console.log or debug code left
- [ ] Sensitive data removed from examples

### Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made

- Detailed list of changes
- What was added/modified/removed

## Testing

- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Edge cases considered

## Screenshots (if applicable)

Before/after screenshots for UI changes

## Related Issues

Fixes #123
Related to #456

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No breaking changes (or documented)
```

### Code Review Process

1. **Automated Checks**: CI/CD runs tests and linters
2. **Maintainer Review**: A maintainer reviews your code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, your PR will be merged

## Release Process

Releases are managed by project maintainers:

1. Version bump according to semver
2. Update CHANGELOG.md
3. Create release tag
4. Publish to npm
5. Create GitHub release

## Getting Help

### Questions?

- Check the [documentation](/guide/getting-started)
- Review [existing issues](https://github.com/toneflix/paystack-cli/issues)
- Ask in GitHub Discussions

### Development Help

- Review the [Development Guide](/guide/development)
- Check [examples](/guide/examples) for code patterns
- Look at existing commands for reference

## Recognition

Contributors will be:

- Listed in README.md contributors section
- Credited in release notes
- Appreciated in the community!

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

## Thank You!

Your contributions make this project better for everyone. Thank you for taking the time to contribute!

---

For more information:

- [Development Guide](/guide/development)
- [Examples](/guide/examples)
- [Troubleshooting](/guide/troubleshooting)
