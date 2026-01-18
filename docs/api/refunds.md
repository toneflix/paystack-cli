# Refunds API

Process refunds for successful transactions.

## Available Commands

| Command         | Description          |
| --------------- | -------------------- |
| `refund:create` | Create a refund      |
| `refund:list`   | List all refunds     |
| `refund:fetch`  | Fetch refund details |

## Create Refund

Refund a successful transaction.

```bash
paystack-cli refund:create --transaction=TRX_xxx
```

### Required Parameters

- `--transaction` - Transaction reference or ID

### Optional Parameters

- `--amount` - Amount to refund in kobo (defaults to full amount)
- `--currency` - Currency
- `--customer_note` - Note for customer
- `--merchant_note` - Internal merchant note

### Examples

```bash
# Full refund
paystack-cli refund:create --transaction=TRX_xxx

# Partial refund
paystack-cli refund:create \
  --transaction=TRX_xxx \
  --amount=25000

# With customer note
paystack-cli refund:create \
  --transaction=TRX_xxx \
  --customer_note="Refund for cancelled order" \
  --merchant_note="Customer requested cancellation"

# Partial with notes
paystack-cli refund:create \
  --transaction=TRX_xxx \
  --amount=10000 \
  --customer_note="Partial refund for item return" \
  --merchant_note="Returned 1 of 3 items"
```

## List Refunds

Get all refunds.

```bash
paystack-cli refund:list
```

### Optional Parameters

- `--reference` - Transaction reference
- `--currency` - Currency filter
- `--perPage` - Records per page
- `--page` - Page number
- `--from` - Start date (YYYY-MM-DD)
- `--to` - End date (YYYY-MM-DD)

### Examples

```bash
# List all refunds
paystack-cli refund:list

# Filter by reference
paystack-cli refund:list --reference=TRX_xxx

# Date range
paystack-cli refund:list \
  --from=2026-01-01 \
  --to=2026-01-31

# With pagination
paystack-cli refund:list --perPage=50 --page=1
```

## Fetch Refund

Get refund details.

```bash
paystack-cli refund:fetch --code=RFD_xxx
```

### Parameters

- `--code` - Refund reference (required)

## Common Workflows

### Process Customer Refund

```bash
# 1. Find transaction
paystack-cli transaction:list \
  --customer=customer@example.com \
  --status=success

# 2. Verify transaction details
paystack-cli transaction:verify --reference=TRX_xxx

# 3. Create refund
paystack-cli refund:create \
  --transaction=TRX_xxx \
  --customer_note="Refund processed as requested"

# 4. Verify refund created
paystack-cli refund:fetch --code=RFD_xxx
```

### Partial Refund for Returns

```bash
# Original transaction: 100,000 (3 items @ 33,333 each)
# Customer returns 1 item

paystack-cli refund:create \
  --transaction=TRX_xxx \
  --amount=33333 \
  --customer_note="Refund for returned item" \
  --merchant_note="Customer returned 1 item, kept 2"
```

### Monthly Refund Report

```bash
# List refunds for the month
paystack-cli refund:list \
  --from=2026-01-01 \
  --to=2026-01-31 \
  --json > refunds-january.json

# Calculate total refunds
cat refunds-january.json | \
  jq '[.data[] | .amount] | add'
```

## Important Notes

- Refunds can only be created for successful transactions
- Partial refunds must not exceed the original transaction amount
- Refund processing time varies by payment method (typically 5-10 business days)
- Cannot refund the same transaction multiple times beyond the original amount
- Paystack fees are not refunded

## Refund Timing

| Payment Method | Processing Time    |
| -------------- | ------------------ |
| Card           | 5-10 business days |
| Bank Transfer  | 1-3 business days  |
| USSD           | 1-3 business days  |

## Next Steps

- [Transactions API](/api/transactions)
- [Customers API](/api/customers)
- [Settlements API](/api/settlements)
