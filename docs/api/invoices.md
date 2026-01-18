# Invoices API

Manage and track invoice records.

## Available Commands

| Command            | Description                   |
| ------------------ | ----------------------------- |
| `invoice:create`   | Create an invoice             |
| `invoice:list`     | List all invoices             |
| `invoice:view`     | View invoice details          |
| `invoice:verify`   | Verify invoice payment status |
| `invoice:send`     | Send invoice notification     |
| `invoice:update`   | Update invoice                |
| `invoice:finalize` | Finalize draft invoice        |
| `invoice:archive`  | Archive invoice               |

## Overview

Invoices in Paystack allow you to bill customers with detailed line items, taxes, and payment terms. They can be sent via email and paid online.

::: tip
The Invoices API is similar to the [Payment Requests API](/api/payment-requests). Payment Requests are simpler one-time payment links, while Invoices offer more detailed billing with line items and tax management.
:::

## Create Invoice

Create a new invoice for a customer.

```bash
paystack-cli invoice:create \
  --customer=CUS_xxx \
  --description="Professional Services" \
  --due_date=2026-02-28
```

### Required Parameters

- `--customer` - Customer code
- `--description` - Invoice description

### Optional Parameters

- `--amount` - Total amount in kobo
- `--due_date` - Payment due date (YYYY-MM-DD)
- `--line_items` - JSON array of line items
- `--tax` - JSON array of tax entries
- `--currency` - Currency (NGN, GHS, ZAR, USD)
- `--draft` - Create as draft (true/false)
- `--send_notification` - Send email notification (true/false)
- `--has_invoice` - Generate PDF (true/false)
- `--invoice_number` - Custom invoice number

### Examples

```bash
# Simple invoice
paystack-cli invoice:create \
  --customer=CUS_xxx \
  --amount=500000 \
  --description="Consulting Services - January 2026" \
  --due_date=2026-02-15

# Invoice with line items
paystack-cli invoice:create \
  --customer=CUS_xxx \
  --description="Website Development Project" \
  --due_date=2026-03-01 \
  --line_items='[
    {"name":"UI/UX Design","amount":300000,"quantity":1},
    {"name":"Frontend Development","amount":500000,"quantity":1},
    {"name":"Backend Development","amount":750000,"quantity":1},
    {"name":"Testing & QA","amount":150000,"quantity":1}
  ]' \
  --tax='[{"name":"VAT (7.5%)","amount":127500}]' \
  --has_invoice=true

# Draft invoice for review
paystack-cli invoice:create \
  --customer=CUS_xxx \
  --description="Monthly Retainer - February" \
  --line_items='[{"name":"Retainer Fee","amount":1000000,"quantity":1}]' \
  --draft=true \
  --invoice_number=INV-2026-002
```

## List Invoices

Get all invoices.

```bash
paystack-cli invoice:list
```

### Optional Parameters

- `--customer` - Filter by customer code
- `--status` - Filter by status (pending, success, failed)
- `--currency` - Filter by currency
- `--perPage` - Records per page
- `--page` - Page number
- `--from` - Start date (YYYY-MM-DD)
- `--to` - End date (YYYY-MM-DD)

### Examples

```bash
# List all invoices
paystack-cli invoice:list

# Pending invoices
paystack-cli invoice:list --status=pending

# Customer invoices
paystack-cli invoice:list --customer=CUS_xxx

# Date range
paystack-cli invoice:list \
  --from=2026-01-01 \
  --to=2026-01-31
```

## View Invoice

Get detailed invoice information.

```bash
paystack-cli invoice:view --code=INV_xxx
```

### Parameters

- `--code` - Invoice code (required)

Returns complete invoice details including line items, taxes, payment status, and PDF download link.

## Verify Invoice

Check invoice payment status.

```bash
paystack-cli invoice:verify --code=INV_xxx
```

### Parameters

- `--code` - Invoice code (required)

## Send Invoice

Send or resend invoice to customer.

```bash
paystack-cli invoice:send --code=INV_xxx
```

### Parameters

- `--code` - Invoice code (required)

Customer receives email with:

- Invoice details
- Payment link
- PDF attachment (if enabled)

## Update Invoice

Modify a draft invoice.

```bash
paystack-cli invoice:update \
  --code=INV_xxx \
  --description="Updated description"
```

### Required Parameters

- `--code` - Invoice code

### Optional Parameters

- `--customer` - Customer code
- `--description` - Description
- `--amount` - Amount
- `--due_date` - Due date
- `--line_items` - Line items
- `--tax` - Tax entries

::: warning
Can only update draft invoices. Finalize the invoice when ready to send.
:::

## Finalize Invoice

Convert draft invoice to active status and send to customer.

```bash
paystack-cli invoice:finalize --code=INV_xxx
```

### Parameters

- `--code` - Invoice code (required)

After finalizing:

- Invoice is sent to customer automatically
- Invoice can no longer be edited
- Payment link becomes active

## Archive Invoice

Archive an invoice (mark as inactive).

```bash
paystack-cli invoice:archive --code=INV_xxx
```

### Parameters

- `--code` - Invoice code (required)

## Common Workflows

### Professional Invoicing Workflow

```bash
# 1. Create detailed invoice
paystack-cli invoice:create \
  --customer=CUS_xxx \
  --description="Q1 2026 Services" \
  --due_date=2026-04-01 \
  --line_items='[
    {"name":"Monthly Retainer (Jan)","amount":500000,"quantity":1},
    {"name":"Monthly Retainer (Feb)","amount":500000,"quantity":1},
    {"name":"Monthly Retainer (Mar)","amount":500000,"quantity":1},
    {"name":"Additional Consulting","amount":300000,"quantity":5}
  ]' \
  --tax='[
    {"name":"VAT (7.5%)","amount":206250}
  ]' \
  --has_invoice=true \
  --invoice_number=INV-2026-Q1-001

# 2. Review invoice
paystack-cli invoice:view --code=INV_xxx

# 3. Send to customer
paystack-cli invoice:send --code=INV_xxx

# 4. Monitor payment
paystack-cli invoice:verify --code=INV_xxx
```

### Draft, Review, Send Process

```bash
# 1. Create draft
paystack-cli invoice:create \
  --customer=CUS_xxx \
  --description="Website Redesign Project" \
  --draft=true \
  --line_items='[{"name":"Design","amount":500000,"quantity":1}]'

# 2. Review with team
paystack-cli invoice:view --code=INV_xxx

# 3. Update if needed
paystack-cli invoice:update \
  --code=INV_xxx \
  --line_items='[
    {"name":"Design","amount":500000,"quantity":1},
    {"name":"Copywriting","amount":200000,"quantity":1}
  ]'

# 4. Finalize and send
paystack-cli invoice:finalize --code=INV_xxx
```

### Monthly Billing

```bash
# Generate invoices for all customers
for customer in CUS_001 CUS_002 CUS_003; do
  paystack-cli invoice:create \
    --customer=$customer \
    --description="Monthly Subscription - February 2026" \
    --amount=500000 \
    --due_date=2026-02-28 \
    --send_notification=true \
    --has_invoice=true
  sleep 2
done
```

## Line Items Format

```json
[
  {
    "name": "Service/Product Name",
    "amount": 100000,
    "quantity": 2
  },
  {
    "name": "Another Item",
    "amount": 50000,
    "quantity": 1
  }
]
```

## Tax Format

```json
[
  {
    "name": "VAT (7.5%)",
    "amount": 15000
  },
  {
    "name": "Service Fee",
    "amount": 5000
  }
]
```

## Invoice Numbering

Best practices for invoice numbers:

- Use consistent format (e.g., INV-YYYY-MM-###)
- Include year and month
- Sequential numbering
- Unique per invoice

Examples:

- `INV-2026-001`
- `INV-2026-01-001` (with month)
- `INV-CLIENT-2026-001` (with client code)

## Payment Terms

Common due date patterns:

```bash
# Net 15 (due in 15 days)
--due_date=$(date -v+15d +%Y-%m-%d)

# Net 30 (due in 30 days)
--due_date=$(date -v+30d +%Y-%m-%d)

# End of month
--due_date=2026-02-28

# Immediate (today)
--due_date=$(date +%Y-%m-%d)
```

## Next Steps

- [Payment Requests API](/api/payment-requests) - Simple payment requests
- [Customers API](/api/customers) - Manage customers
- [Transactions API](/api/transactions) - View payments
