# Settlements API

View settlement records and history.

## Available Commands

| Command            | Description                   |
| ------------------ | ----------------------------- |
| `settlement:list`  | List all settlements          |
| `settlement:fetch` | Fetch settlement transactions |

## List Settlements

Get all settlement records.

```bash
paystack-cli settlement:list
```

### Optional Parameters

- `--perPage` - Records per page
- `--page` - Page number
- `--from` - Start date (YYYY-MM-DD)
- `--to` - End date (YYYY-MM-DD)
- `--subaccount` - Filter by subaccount code

### Examples

```bash
# List all settlements
paystack-cli settlement:list

# With pagination
paystack-cli settlement:list --perPage=50 --page=1

# Filter by date range
paystack-cli settlement:list \
  --from=2026-01-01 \
  --to=2026-01-31

# Filter by subaccount
paystack-cli settlement:list --subaccount=ACCT_xxx

# Export to JSON
paystack-cli settlement:list --json > settlements.json
```

### Response

```json
{
  "status": true,
  "message": "Settlements retrieved",
  "data": [
    {
      "id": 12345,
      "domain": "live",
      "status": "success",
      "currency": "NGN",
      "integration": 100032,
      "total_amount": 1000000,
      "effective_amount": 985000,
      "total_fees": 15000,
      "total_processed": 1000000,
      "deductions": null,
      "settlement_date": "2026-01-15T12:00:00.000Z",
      "settled_by": null,
      "createdAt": "2026-01-15T10:00:00.000Z",
      "updatedAt": "2026-01-15T12:00:00.000Z"
    }
  ]
}
```

## Fetch Settlement Transactions

Get transactions included in a settlement.

```bash
paystack-cli settlement:fetch --id=12345
```

### Parameters

- `--id` - Settlement ID (required)

### Optional Parameters

- `--perPage` - Records per page
- `--page` - Page number
- `--from` - Start date
- `--to` - End date

### Examples

```bash
# Get settlement transactions
paystack-cli settlement:fetch --id=12345

# With pagination
paystack-cli settlement:fetch \
  --id=12345 \
  --perPage=100 \
  --page=1

# Export transactions
paystack-cli settlement:fetch --id=12345 --json > settlement-12345.json
```

## Common Workflows

### Review Monthly Settlements

```bash
# 1. List settlements for the month
paystack-cli settlement:list \
  --from=2026-01-01 \
  --to=2026-01-31 \
  --json > january-settlements.json

# 2. Calculate total settled amount
cat january-settlements.json | \
  jq '[.data[] | .effective_amount] | add'

# 3. Review specific settlement
paystack-cli settlement:fetch --id=12345
```

### Reconcile Settlement

```bash
# 1. Get settlement details
paystack-cli settlement:list --from=2026-01-15 --to=2026-01-15

# 2. Fetch all transactions in settlement
paystack-cli settlement:fetch --id=12345 --perPage=500

# 3. Compare with expected transactions
# 4. Verify amounts match bank statement
```

### Subaccount Settlements

```bash
# 1. List settlements for subaccount
paystack-cli settlement:list --subaccount=ACCT_xxx

# 2. Get transactions for specific settlement
paystack-cli settlement:fetch --id=12345

# 3. Verify subaccount commission
```

## Settlement Breakdown

### Amount Components

- **total_amount**: Total transaction amount
- **total_fees**: Paystack fees charged
- **effective_amount**: Amount settled to your account (total_amount - total_fees)
- **total_processed**: Total transactions processed
- **deductions**: Any additional deductions

Formula:

```sh
effective_amount = total_amount - total_fees - deductions
```

## Settlement Schedule

Your settlement schedule is configured in your Paystack Dashboard:

- **Daily**: Settlements every business day
- **Weekly**: Settlements once per week
- **Monthly**: Settlements once per month
- **Custom**: Custom settlement schedule

## Important Notes

- Settlements only include successful transactions
- Refunded transactions are deducted from settlements
- Chargebacks are deducted from future settlements
- Check your Dashboard for exact settlement schedule
- Settlements to subaccounts follow the same schedule

## Reporting

### Export Settlement Report

```bash
# Get settlement data
paystack-cli settlement:fetch --id=12345 --json | \
  jq -r '.data[] | [.reference, .amount, .fees, .status] | @csv' > settlement-report.csv
```

### Calculate Net Revenue

```bash
# Get monthly revenue after fees
paystack-cli settlement:list \
  --from=2026-01-01 \
  --to=2026-01-31 \
  --json | \
  jq '[.data[] | .effective_amount] | add'
```

## Next Steps

- [Balance API](/api/balance)
- [Transactions API](/api/transactions)
- [Subaccounts API](/api/subaccounts)
