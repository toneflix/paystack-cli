# Paystack CLI Documentation

This directory contains the VitePress documentation site for Paystack CLI.

## Development

Run the documentation site locally:

```bash
pnpm docs:dev
```

The site will be available at `http://localhost:5173`

## Build

Build the documentation for production:

```bash
pnpm docs:build
```

## Preview

Preview the production build:

```bash
pnpm docs:preview
```

## Structure

- `.vitepress/` - VitePress configuration
- `guide/` - User guides and tutorials
- `api/` - API reference documentation
- `index.md` - Home page

## Contributing

When adding new features to the CLI:

1. Update relevant API reference pages in `api/`
2. Add examples to `guide/examples.md`
3. Update command listings in `guide/commands.md`
4. Test documentation locally with `pnpm docs:dev`

## Deployment

The documentation can be deployed to:

- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

Build output is in `docs/.vitepress/dist/`
