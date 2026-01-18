---
layout: home

hero:
  name: Paystack CLI
  text: Build, test, and manage your Paystack integration
  tagline: Access all Paystack API endpoints directly from your terminal
  image:
    src: /banner.png
    alt: Paystack CLI
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/toneflix/paystack-cli

features:
  - icon: 🚀
    title: Complete API Access
    details: Access all Paystack API endpoints directly from your terminal with full parameter support
  - icon: 🔐
    title: Secure Authentication
    details: Login once and securely manage your Paystack integration with automatic session management
  - icon: 🎣
    title: Local Webhook Testing
    details: Test webhooks locally using ngrok integration with automatic tunnel setup
  - icon: 🔧
    title: Easy Configuration
    details: Configure API settings, timeouts, and debug modes with interactive prompts
  - icon: 📊
    title: Beautiful Output
    details: Formatted JSON responses with colored output for better readability
  - icon: 💪
    title: Developer Friendly
    details: Built with TypeScript for type safety and better developer experience
---

## Quick Start

::: code-group

```bash [npm]
npm install -g @toneflix/paystack-cli
```

```bash [pnpm]
pnpm add -g @toneflix/paystack-cli
```

```bash [yarn]
yarn global add @toneflix/paystack-cli
```

:::

## Basic Usage

```bash
# Initialize the CLI
paystack-cli init

# Login to your Paystack account
paystack-cli login

# Start using commands
paystack-cli transaction:list
paystack-cli customer:create --email=user@example.com --first_name=John
paystack-cli plan:create --name="Premium" --amount=50000 --interval=monthly
```

## What's Next?

- [Getting Started](/guide/getting-started) - Install and setup the CLI
- [Authentication](/guide/authentication) - Learn about login and session management
- [API Reference](/api/transactions) - Explore all available API commands
- [Webhook Testing](/guide/webhook-testing) - Test webhooks locally
