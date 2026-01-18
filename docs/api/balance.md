# Balance API

Check your Paystack account balance.

## Available Commands

| Command          | Description           |
| ---------------- | --------------------- |
| `balance:fetch`  | Fetch current balance |
| `balance:ledger` | View balance ledger   |

## Fetch Balance

Get your current account balance.

```bash
paystack-cli balance:fetch
```

### Response

```json
{
  "status": true,
  "message": "Balances retrieved",
  "data": [
    {
      "currency": "NGN",
      "balance": 5000000
    },
    {
      "currency": "GHS",
      "balance": 100000
    }
  ]
}
```

Shows available balance in each currency you've received payments in.

## Balance Ledger

View balance ledger with transaction history.

```bash
paystack-cli balance:ledger
```

### Optional Parameters

- `--perPage` - Records per page
- `--page` - Page number
- `--from` - Start date (YYYY-MM-DD)
- `--to` - End date (YYYY-MM-DD)

### Examples

```bash
# View ledger
paystack-cli balance:ledger

# With pagination
paystack-cli balance:ledger --perPage=100 --page=1

# Filter by date
paystack-cli balance:ledger \
  --from=2026-01-01 \
  --to=2026-01-31

# Export to JSON
paystack-cli balance:ledger --json > ledger.json
```

### Response

The ledger shows all balance movements including:

- Incoming payments
- Outgoing transfers
- Refunds
- Chargebacks
- Fees
- Settlements

## Common Workflows

### Check Before Transfer

```bash
# 1. Check available balance
paystack-cli balance:fetch

# 2. Calculate transfer + fees
# 3. Initiate transfer if sufficient
paystack-cli transfer:initiate \
  --source=balance \
  --amount=50000 \
  --recipient=RCP_xxx
```

### Monthly Reconciliation

```bash
# 1. Get starting balance
paystack-cli balance:ledger \
  --from=2025-12-31 \
  --to=2025-12-31

# 2. Get all transactions for month
paystack-cli balance:ledger \
  --from=2026-01-01 \
  --to=2026-01-31 \
  --json > january-ledger.json

# 3. Get ending balance
paystack-cli balance:fetch

# 4. Reconcile totals
```

### Track Balance Changes

```bash
# Get today's ledger
paystack-cli balance:ledger \
  --from=$(date +%Y-%m-%d) \
  --to=$(date +%Y-%m-%d)

# Monitor specific period
paystack-cli balance:ledger \
  --from=2026-01-01 \
  --to=2026-01-07
```

## Balance Components

Your balance includes:

### Inflows

- Successful transactions
- Refunded transfer fees
- Dispute resolutions in your favor

### Outflows

- Transfers to bank accounts
- Paystack fees
- Refunds to customers
- Chargebacks
- Settlements to your bank

## Important Notes

- Balance is shown in kobo (smallest currency unit)
- Divide by 100 to get Naira/Cedi/Rand amount
- Balance updates in real-time
- Different currency balances are separate
- Cannot transfer across currencies
- Negative balance may occur due to chargebacks/refunds

## Convert Kobo to Currency

```bash
# Get balance in kobo
paystack-cli balance:fetch --json | \
  jq '.data[] | select(.currency=="NGN") | .balance'

# Convert to Naira (divide by 100)
paystack-cli balance:fetch --json | \
  jq '.data[] | select(.currency=="NGN") | .balance / 100'
```

## Minimum Balance

Maintain sufficient balance for:

- Transfers (amount + fees)
- Refunds
- Potential chargebacks

**Tip**: Set up balance alerts in your Paystack Dashboard.

## Next Steps

- [Transfers API](/api/transfers)
- [Settlements API](/api/settlements)
- [Transactions API](/api/transactions)
