# Bulk Charges API

Charge multiple customers at once using saved authorization codes.

## Available Commands

| Command               | Description                  |
| --------------------- | ---------------------------- |
| `bulkcharge:initiate` | Create a bulk charge batch   |
| `bulkcharge:list`     | List all bulk charge batches |
| `bulkcharge:fetch`    | Fetch batch details          |
| `bulkcharge:charges`  | Get charges in a batch       |
| `bulkcharge:pause`    | Pause a batch                |
| `bulkcharge:resume`   | Resume a paused batch        |

## Initiate Bulk Charge

Create a batch to charge multiple customers.

```bash
paystack-cli bulkcharge:initiate \
  --body='[
    {"authorization":"AUTH_xxx1","amount":50000,"reference":"REF_001"},
    {"authorization":"AUTH_xxx2","amount":30000,"reference":"REF_002"},
    {"authorization":"AUTH_xxx3","amount":75000,"reference":"REF_003"}
  ]'
```

### Parameters

- `--body` - JSON array of charge objects (required)

### Charge Object Format

```json
{
  "authorization": "AUTH_xxx",
  "amount": 50000,
  "reference": "unique_reference"
}
```

### Examples

```bash
# Create bulk charge batch
paystack-cli bulkcharge:initiate \
  --body='[
    {"authorization":"AUTH_xxx1","amount":100000,"reference":"MONTHLY_JAN_001"},
    {"authorization":"AUTH_xxx2","amount":100000,"reference":"MONTHLY_JAN_002"},
    {"authorization":"AUTH_xxx3","amount":100000,"reference":"MONTHLY_JAN_003"}
  ]'

# From file
paystack-cli bulkcharge:initiate \
  --body="$(cat bulk-charges.json)"
```

### bulk-charges.json Example

```json
[
  {
    "authorization": "AUTH_customer1",
    "amount": 100000,
    "reference": "SUB_001_JAN"
  },
  {
    "authorization": "AUTH_customer2",
    "amount": 100000,
    "reference": "SUB_002_JAN"
  },
  {
    "authorization": "AUTH_customer3",
    "amount": 100000,
    "reference": "SUB_003_JAN"
  }
]
```

## List Bulk Charge Batches

Get all bulk charge batches.

```bash
paystack-cli bulkcharge:list
```

### Optional Parameters

- `--perPage` - Records per page
- `--page` - Page number
- `--from` - Start date (YYYY-MM-DD)
- `--to` - End date (YYYY-MM-DD)

### Examples

```bash
# List all batches
paystack-cli bulkcharge:list

# With pagination
paystack-cli bulkcharge:list --perPage=50 --page=1

# Filter by date
paystack-cli bulkcharge:list \
  --from=2026-01-01 \
  --to=2026-01-31
```

## Fetch Batch Details

Get bulk charge batch information.

```bash
paystack-cli bulkcharge:fetch --code=BCH_xxx
```

### Parameters

- `--code` - Batch code (required)

## Get Batch Charges

List all charges in a batch.

```bash
paystack-cli bulkcharge:charges --code=BCH_xxx
```

### Parameters

- `--code` - Batch code (required)

### Optional Parameters

- `--status` - Filter by status (pending, success, failed)
- `--perPage` - Records per page
- `--page` - Page number

### Examples

```bash
# Get all charges
paystack-cli bulkcharge:charges --code=BCH_xxx

# Filter successful charges
paystack-cli bulkcharge:charges \
  --code=BCH_xxx \
  --status=success

# Filter failed charges
paystack-cli bulkcharge:charges \
  --code=BCH_xxx \
  --status=failed
```

## Pause Batch

Pause an ongoing bulk charge batch.

```bash
paystack-cli bulkcharge:pause --code=BCH_xxx
```

### Parameters

- `--code` - Batch code (required)

Pauses processing of remaining charges in the batch.

## Resume Batch

Resume a paused bulk charge batch.

```bash
paystack-cli bulkcharge:resume --code=BCH_xxx
```

### Parameters

- `--code` - Batch code (required)

Resumes processing from where it was paused.

## Common Workflows

### Monthly Subscription Billing

```bash
# 1. Prepare customer authorization codes
# (Get from successful transactions or customer:fetch)

# 2. Create bulk charge file
cat > monthly-billing.json << 'EOF'
[
  {"authorization":"AUTH_1","amount":50000,"reference":"MONTHLY_JAN_CUST_1"},
  {"authorization":"AUTH_2","amount":50000,"reference":"MONTHLY_JAN_CUST_2"},
  {"authorization":"AUTH_3","amount":50000,"reference":"MONTHLY_JAN_CUST_3"}
]
EOF

# 3. Initiate bulk charge
paystack-cli bulkcharge:initiate \
  --body="$(cat monthly-billing.json)"

# 4. Monitor batch progress
paystack-cli bulkcharge:fetch --code=BCH_xxx

# 5. Get successful charges
paystack-cli bulkcharge:charges \
  --code=BCH_xxx \
  --status=success

# 6. Handle failed charges
paystack-cli bulkcharge:charges \
  --code=BCH_xxx \
  --status=failed > failed-charges.json
```

### Retry Failed Charges

```bash
# 1. Get failed charges from previous batch
paystack-cli bulkcharge:charges \
  --code=BCH_original \
  --status=failed \
  --json > failed.json

# 2. Extract and format for retry
cat failed.json | \
  jq '[.data[] | {authorization: .authorization.authorization_code, amount: .amount, reference: (.reference + "_RETRY")}]' > retry.json

# 3. Create new batch with failed charges
paystack-cli bulkcharge:initiate \
  --body="$(cat retry.json)"
```

### Progress Monitoring

```bash
# Monitor batch in real-time
watch -n 10 'paystack-cli bulkcharge:fetch --code=BCH_xxx'

# Or check periodically
while true; do
  paystack-cli bulkcharge:fetch --code=BCH_xxx
  sleep 30
done
```

### Generate Billing Report

```bash
# Get all charges
paystack-cli bulkcharge:charges --code=BCH_xxx --json > charges.json

# Count success/failed
echo "Successful: $(cat charges.json | jq '[.data[] | select(.status=="success")] | length')"
echo "Failed: $(cat charges.json | jq '[.data[] | select(.status=="failed")] | length')"

# Calculate total collected
cat charges.json | \
  jq '[.data[] | select(.status=="success") | .amount] | add / 100'
```

## Best Practices

### Prepare Authorization Codes

```bash
# 1. List customers with transactions
paystack-cli customer:list --perPage=100

# 2. For each customer, get authorization
paystack-cli customer:fetch --code=CUS_xxx --json | \
  jq '.data.authorizations[] | select(.reusable==true)'

# 3. Build bulk charge array
# Ensure authorization is active and reusable
```

### Handle Rate Limits

- Process batches during off-peak hours
- Keep batch sizes reasonable (< 1000 charges per batch)
- Monitor and pause if needed
- Use references to track and avoid duplicates

### Error Handling

- Always check batch status after initiation
- Review failed charges and reasons
- Set up retry logic for failed charges
- Keep logs of batch codes and results

## Charge Status

| Status  | Description                                                     |
| ------- | --------------------------------------------------------------- |
| pending | Charge queued, not yet processed                                |
| success | Charge successful                                               |
| failed  | Charge failed (insufficient funds, invalid authorization, etc.) |

## Important Notes

- Only use active, reusable authorization codes
- Each reference must be unique across all batches
- Customers are charged immediately when batch processes
- Failed charges don't automatically retry
- Batch processing is asynchronous
- Monitor batches to handle failures

## Next Steps

- [Customers API](/api/customers)
- [Transactions API](/api/transactions)
