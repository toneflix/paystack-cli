# Development Guide

Set up and contribute to Paystack CLI development.

## Prerequisites

- Node.js 18 or higher
- pnpm package manager
- Git

## Setup Development Environment

### 1. Clone the Repository

```bash
git clone https://github.com/toneflix/paystack-cli.git
cd paystack-cli
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Build the Project

```bash
pnpm run build
```

### 4. Link for Local Testing

```bash
pnpm link --global
```

Now you can run `paystack-cli` commands using your local development version.

## Project Structure

```md
paystack-cli/
├── bin/ # Executable entry points
│ ├── cli.cjs # CommonJS wrapper
│ └── cli.js # Main CLI entry point
├── src/ # TypeScript source code
│ ├── cli.ts # CLI initialization
│ ├── Commands/ # Command implementations
│ ├── Contracts/ # TypeScript interfaces
│ ├── paystack/ # API and webhook modules
│ ├── db.ts # Database operations
│ ├── env.d.ts # Environment types
│ ├── helpers.ts # Utility functions
│ ├── hooks.ts # Command hooks
│ ├── logo.ts # ASCII logo
│ └── Paystack.ts # Paystack API client
├── docs/ # Documentation (VitePress)
├── dist/ # Build output
└── package.json # Package configuration
```

## Technology Stack

- **CLI Framework**: H3ravel Musket - Command routing and handling
- **Language**: TypeScript
- **Build Tool**: tsdown
- **Testing**: Vitest
- **Database**: better-sqlite3 for local session storage
- **HTTP Client**: Axios for API requests
- **Environment**: dotenv for configuration

## Development Commands

### Build the Project

```bash
# Development build with watch mode
pnpm run dev

# Production build
pnpm run build
```

### Run Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

### Code Quality

```bash
# Type checking
pnpm run typecheck

# Linting
pnpm run lint

# Format code
pnpm run format
```

## Adding a New Command

### 1. Create Command Class

Create a new file in `src/Commands/`:

```typescript
// src/Commands/MyNewCommand.ts
import { Command } from 'h3ravel-musket';
import paystack from '../Paystack';
import { output } from '../helpers';

export default class MyNewCommand extends Command {
  static signature = 'my:command {argument} {--option=}';
  static description = 'Description of my new command';

  async handle() {
    const argument = this.argument('argument');
    const option = this.option('option');

    try {
      const response = await paystack.api.myEndpoint({
        argument,
        option,
      });

      output(response.data, this.json);
    } catch (error) {
      this.error('Error message');
      throw error;
    }
  }
}
```

### 2. Register Command

Add to `src/Commands/Commands.ts`:

```typescript
import MyNewCommand from './MyNewCommand';

export const commands = [
  // ... existing commands
  MyNewCommand,
];
```

### 3. Test Your Command

```bash
pnpm run build
paystack-cli my:command test-arg --option=test-value
```

## Working with the Paystack API

### API Client Structure

The API client is in `src/Paystack.ts`:

```typescript
class Paystack {
  constructor(secretKey: string) {
    this.secretKey = secretKey;
    this.api = new PaystackAPI(secretKey);
  }
}
```

### Adding New API Endpoints

Edit `src/paystack/apis.ts`:

```typescript
export class PaystackAPI {
  // Add new endpoint method
  async myNewEndpoint(data: MyDataType) {
    return this.request<MyResponseType>({
      method: 'POST',
      url: '/my-endpoint',
      data,
    });
  }

  private async request<T>(config: AxiosRequestConfig) {
    // Request implementation
  }
}
```

### Type Definitions

Add interfaces in `src/Contracts/Interfaces.ts`:

```typescript
export interface MyDataType {
  field1: string;
  field2?: number;
}

export interface MyResponseType {
  status: boolean;
  message: string;
  data: {
    // response structure
  };
}
```

## Database Operations

The CLI uses SQLite for session management in `src/db.ts`:

```typescript
import Database from 'better-sqlite3';

const db = new Database('paystack-cli.db');

// Create table
db.exec(`
  CREATE TABLE IF NOT EXISTS my_table (
    id INTEGER PRIMARY KEY,
    data TEXT
  )
`);

// Insert data
const insert = db.prepare('INSERT INTO my_table (data) VALUES (?)');
insert.run(JSON.stringify(data));

// Query data
const query = db.prepare('SELECT * FROM my_table WHERE id = ?');
const result = query.get(id);
```

## Testing

### Unit Test Example

Create test files in `src/__tests__/`:

```typescript
import { describe, it, expect } from 'vitest';
import MyNewCommand from '../Commands/MyNewCommand';

describe('MyNewCommand', () => {
  it('should process argument correctly', () => {
    const command = new MyNewCommand();
    // Test implementation
    expect(command).toBeDefined();
  });
});
```

### Integration Testing

Test with actual API (use test mode):

```bash
export PAYSTACK_SECRET_KEY="sk_test_xxxxx"
pnpm test:integration
```

## Debugging

### Enable Debug Mode

```bash
export DEBUG=paystack:*
paystack-cli your-command
```

### Inspect Database

```bash
sqlite3 ~/.paystack-cli/paystack-cli.db
.tables
SELECT * FROM sessions;
.quit
```

### Check Logs

The CLI logs are stored in:

- macOS/Linux: `~/.paystack-cli/logs/`
- Windows: `%APPDATA%/.paystack-cli/logs/`

## Building for Release

### 1. Update Version

```bash
pnpm version patch  # or minor, major
```

### 2. Build

```bash
pnpm run build
```

### 3. Test Distribution

```bash
pnpm pack
npm install -g paystack-cli-*.tgz
```

### 4. Publish

```bash
pnpm publish
```

## Code Style Guidelines

### TypeScript

- Use strict mode
- Define explicit types for public APIs
- Use interfaces over type aliases for objects
- Prefer const over let

### Naming Conventions

- Commands: PascalCase (e.g., `TransactionInitCommand`)
- Files: PascalCase for classes, camelCase for utilities
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE

### Error Handling

Always use try-catch blocks for API calls:

```typescript
try {
  const response = await paystack.api.someEndpoint(data);
  output(response.data, this.json);
} catch (error) {
  this.error('Descriptive error message');
  throw error;
}
```

### Documentation

- Add JSDoc comments for public methods
- Update README.md for new features
- Include examples in documentation

## Environment Variables

For development, create `.env` file:

```sh
PAYSTACK_SECRET_KEY=sk_test_xxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
DEBUG=paystack:*
NODE_ENV=development
```

## CI/CD

The project uses GitHub Actions for:

- Running tests on pull requests
- Building and publishing releases
- Running linters and type checks

Configuration is in `.github/workflows/`.

## Need Help?

- Check [Troubleshooting](/guide/troubleshooting)
- Review [Contributing Guidelines](/guide/contributing)
- Join discussions on GitHub
- Review existing issues and PRs

## Next Steps

- Read [Contributing Guidelines](/guide/contributing)
- Check [API Reference](/api/transactions)
- Explore [Examples](/guide/examples)
