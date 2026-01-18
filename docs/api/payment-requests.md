# Payment Requests API

Create and send payment request invoices to customers.

## Available Commands

| Command                   | Description                   |
| ------------------------- | ----------------------------- |
| `paymentrequest:create`   | Create a payment request      |
| `paymentrequest:list`     | List all payment requests     |
| `paymentrequest:fetch`    | Fetch payment request details |
| `paymentrequest:verify`   | Verify payment request status |
| `paymentrequest:send`     | Send notification to customer |
| `paymentrequest:invoice`  | Get payment request invoice   |
| `paymentrequest:total`    | Get payment request totals    |
| `paymentrequest:finalize` | Finalize a draft invoice      |
| `paymentrequest:update`   | Update a payment request      |
| `paymentrequest:archive`  | Archive a payment request     |

## Create Payment Request

Create a payment request (invoice).

```bash
paystack-cli paymentrequest:create \
  --customer=CUS_xxx \
  --amount=100000 \
  --description="Invoice for services"
```

### Required Parameters

- `--customer` - Customer code

### Optional Parameters

- `--amount` - Amount in kobo
- `--due_date` - Due date (YYYY-MM-DD)
- `--description` - Invoice description
- `--line_items` - JSON array of line items
- `--tax` - JSON array of tax rules
- `--currency` - Currency (NGN, GHS, ZAR, USD)
- `--send_notification` - Send email (true/false)
- `--draft` - Create as draft (true/false)
- `--has_invoice` - Generate PDF invoice (true/false)
- `--invoice_number` - Custom invoice number
- `--split_code` - Split payment code

### Examples

```bash
# Simple invoice
paystack-cli paymentrequest:create \
  --customer=CUS_xxx \
  --amount=100000 \
  --description="Website development services" \
  --due_date=2026-02-28

# With line items
paystack-cli paymentrequest:create \
  --customer=CUS_xxx \
  --description="Project invoice" \
  --due_date=2026-03-01 \
  --line_items='[
    {"name":"Frontend Development","amount":500000,"quantity":1},
    {"name":"Backend Development","amount":750000,"quantity":1},
    {"name":"Hosting Setup","amount":50000,"quantity":1}
  ]'

# With tax
paystack-cli paymentrequest:create \
  --customer=CUS_xxx \
  --amount=100000 \
  --description="Product purchase" \
  --tax='[
    {"name":"VAT","amount":7500}
  ]'

# Draft invoice
paystack-cli paymentrequest:create \
  --customer=CUS_xxx \
  --amount=100000 \
  --description="Draft invoice" \
  --draft=true \
  --has_invoice=true \
  --invoice_number=INV-2026-001
```

## List Payment Requests

Get all payment requests.

```bash
paystack-cli paymentrequest:list
```

### Optional Parameters

- `--perPage` - Records per page
- `--page` - Page number
- `--customer` - Filter by customer code
- `--status` - Filter by status (pending, success)
- `--currency` - Filter by currency
- `--from` - Start date
- `--to` - End date

### Examples

```bash
# List all
paystack-cli paymentrequest:list

# Filter by customer
paystack-cli paymentrequest:list --customer=CUS_xxx

# Filter pending invoices
paystack-cli paymentrequest:list --status=pending

# Date range
paystack-cli paymentrequest:list \
  --from=2026-01-01 \
  --to=2026-01-31
```

## Fetch Payment Request

Get payment request details.

```bash
paystack-cli paymentrequest:fetch --code=PRQ_xxx
```

### Parameters

- `--code` - Payment request code (required)

## Verify Payment Request

Check if payment request has been paid.

```bash
paystack-cli paymentrequest:verify --code=PRQ_xxx
```

### Parameters

- `--code` - Payment request code (required)

## Send Notification

Send or resend payment request to customer.

```bash
paystack-cli paymentrequest:send --code=PRQ_xxx
```

### Parameters

- `--code` - Payment request code (required)

Customer receives email with payment link.

## Get Invoice

Retrieve payment request as invoice.

```bash
paystack-cli paymentrequest:invoice --code=PRQ_xxx
```

### Parameters

- `--code` - Payment request code (required)

Returns invoice details and PDF download URL.

## Payment Request Totals

Get payment request statistics.

```bash
paystack-cli paymentrequest:total
```

### Optional Parameters

- `--perPage` - Records per page
- `--page` - Page number
- `--from` - Start date
- `--to` - End date

## Finalize Draft

Convert draft to active payment request.

```bash
paystack-cli paymentrequest:finalize --code=PRQ_xxx
```

### Parameters

- `--code` - Payment request code (required)

Sends invoice to customer after finalizing.

## Update Payment Request

Update a draft payment request.

```bash
paystack-cli paymentrequest:update \
  --code=PRQ_xxx \
  --amount=150000
```

### Required Parameters

- `--code` - Payment request code

### Optional Parameters

- `--amount` - Amount
- `--description` - Description
- `--due_date` - Due date
- `--line_items` - Line items
- `--tax` - Tax rules

**Note**: Can only update draft payment requests.

## Archive Payment Request

Archive a payment request.

```bash
paystack-cli paymentrequest:archive --code=PRQ_xxx
```

### Parameters

- `--code` - Payment request code (required)

## Common Workflows

### Complete Invoicing Process

```bash
# 1. Create customer (if needed)
paystack-cli customer:create \
  --email=client@example.com \
  --first_name=Jane \
  --last_name=Smith

# 2. Create invoice
paystack-cli paymentrequest:create \
  --customer=CUS_xxx \
  --description="Consulting services - January 2026" \
  --due_date=2026-02-15 \
  --line_items='[
    {"name":"Strategy Consulting","amount":500000,"quantity":5},
    {"name":"Implementation Support","amount":300000,"quantity":3}
  ]' \
  --tax='[{"name":"VAT (7.5%)","amount":105000}]' \
  --has_invoice=true \
  --invoice_number=INV-2026-001

# 3. Send to customer
paystack-cli paymentrequest:send --code=PRQ_xxx

# 4. Check payment status
paystack-cli paymentrequest:verify --code=PRQ_xxx

# 5. Get invoice PDF
paystack-cli paymentrequest:invoice --code=PRQ_xxx
```

### Draft and Review Workflow

```bash
# 1. Create draft
paystack-cli paymentrequest:create \
  --customer=CUS_xxx \
  --amount=100000 \
  --description="Draft invoice" \
  --draft=true \
  --has_invoice=true

# 2. Review and update
paystack-cli paymentrequest:update \
  --code=PRQ_xxx \
  --amount=120000 \
  --description="Updated invoice description"

# 3. Finalize and send
paystack-cli paymentrequest:finalize --code=PRQ_xxx
```

### Monthly Invoicing

```bash
# Create recurring monthly invoices
for month in {1..12}; do
  paystack-cli paymentrequest:create \
    --customer=CUS_xxx \
    --amount=500000 \
    --description="Monthly subscription - Month $month" \
    --due_date=2026-$(printf "%02d" $month)-01 \
    --send_notification=false \
    --has_invoice=true
done

# Send first month
paystack-cli paymentrequest:send --code=PRQ_first
```

## Line Items Format

```json
[
  {
    "name": "Item Name",
    "amount": 50000,
    "quantity": 2
  },
  {
    "name": "Another Item",
    "amount": 30000,
    "quantity": 1
  }
]
```

## Tax Format

```json
[
  {
    "name": "VAT (7.5%)",
    "amount": 7500
  },
  {
    "name": "Service Charge",
    "amount": 2000
  }
]
```

## Next Steps

- [Customers API](/api/customers)
- [Transactions API](/api/transactions)
- [Invoices API](/api/invoices)
