import { defineConfig } from 'vitepress'

export default defineConfig({
    title: 'Paystack CLI',
    description: 'Build, test, and manage your Paystack integration from the terminal',
    cleanUrls: true,
    lastUpdated: true,
    head: [
        ['link', { rel: 'icon', href: '/favicon.ico' }],
        ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
        ['meta', { name: 'theme-color', content: '#07c4f9' }],
        ['meta', { name: 'description', content: 'Build, test, and manage your Paystack integration from the terminal' }],
        ['meta', { property: 'og:title', content: 'Paystack CLI' }],
        ['meta', { property: 'og:description', content: 'Build, test, and manage your Paystack integration from the terminal' }],
        ['meta', { property: 'og:image', content: '/banner.png' }],
        ['meta', { property: 'og:url', content: 'https://paystack.cli.toneflix.net' }],
        ['meta', { name: 'twitter:card', content: 'summary_large_image' }]
    ],

    themeConfig: {
        logo: '/logo.svg',

        nav: [
            { text: 'Guide', link: '/guide/getting-started' },
            { text: 'API Reference', link: '/api/transactions' },
            { text: 'GitHub', link: 'https://github.com/toneflix/paystack-cli' },
            { text: 'npm', link: 'https://www.npmjs.com/package/@toneflix/paystack-cli' }
        ],

        sidebar: {
            '/guide/': [
                {
                    text: 'Introduction',
                    items: [
                        { text: 'What is Paystack CLI?', link: '/guide/what-is-paystack-cli' },
                        { text: 'Getting Started', link: '/guide/getting-started' },
                        { text: 'Quick Start', link: '/guide/quick-start' }
                    ]
                },
                {
                    text: 'Core Concepts',
                    items: [
                        { text: 'Authentication', link: '/guide/authentication' },
                        { text: 'Configuration', link: '/guide/configuration' },
                        { text: 'Commands', link: '/guide/commands' }
                    ]
                },
                {
                    text: 'Features',
                    items: [
                        { text: 'Webhook Testing', link: '/guide/webhook-testing' },
                        { text: 'Examples', link: '/guide/examples' }
                    ]
                },
                {
                    text: 'Advanced',
                    items: [
                        { text: 'Development', link: '/guide/development' },
                        { text: 'Troubleshooting', link: '/guide/troubleshooting' },
                        { text: 'Contributing', link: '/guide/contributing' }
                    ]
                }
            ],
            '/api/': [
                {
                    text: 'Payment Resources',
                    items: [
                        { text: 'Transactions', link: '/api/transactions' },
                        { text: 'Customers', link: '/api/customers' },
                        { text: 'Payment Pages', link: '/api/payment-pages' },
                        { text: 'Payment Requests', link: '/api/payment-requests' },
                        { text: 'Invoices', link: '/api/invoices' }
                    ]
                },
                {
                    text: 'Recurring Payments',
                    items: [
                        { text: 'Plans', link: '/api/plans' },
                        { text: 'Subscriptions', link: '/api/subscriptions' },
                        { text: 'Bulk Charges', link: '/api/bulk-charges' }
                    ]
                },
                {
                    text: 'Transfers & Payouts',
                    items: [
                        { text: 'Transfers', link: '/api/transfers' },
                        { text: 'Transfer Recipients', link: '/api/transfer-recipients' },
                        { text: 'Banks', link: '/api/banks' },
                        { text: 'Verifications', link: '/api/verifications' }
                    ]
                },
                {
                    text: 'Settlements & Revenue',
                    items: [
                        { text: 'Balance', link: '/api/balance' },
                        { text: 'Settlements', link: '/api/settlements' },
                        { text: 'Subaccounts', link: '/api/subaccounts' },
                        { text: 'Refunds', link: '/api/refunds' }
                    ]
                }
            ]
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/toneflix/paystack-cli' }
        ],

        footer: {
            message: 'Released under the ISC License.',
            copyright: 'Copyright © 2026 ToneFlix Technologies Limited'
        },

        search: {
            provider: 'local'
        }
    }
})
