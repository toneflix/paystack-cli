# Subaccounts API

Create subaccounts for split payment settlements.

## Available Commands

| Command             | Description              |
| ------------------- | ------------------------ |
| `subaccount:create` | Create a subaccount      |
| `subaccount:list`   | List all subaccounts     |
| `subaccount:fetch`  | Fetch subaccount details |
| `subaccount:update` | Update subaccount        |

## Create Subaccount

Create a new subaccount for split payments.

```bash
paystack-cli subaccount:create \
  --business_name="Vendor Co" \
  --settlement_bank=033 \
  --account_number=0123456789 \
  --percentage_charge=10
```

### Required Parameters

- `--business_name` - Business name
- `--settlement_bank` - Bank code
- `--account_number` - Account number
- `--percentage_charge` - Percentage of transaction (0-100)

### Optional Parameters

- `--description` - Subaccount description
- `--primary_contact_email` - Contact email
- `--primary_contact_name` - Contact name
- `--primary_contact_phone` - Contact phone
- `--metadata` - Custom metadata JSON

### Examples

```bash
# Basic subaccount
paystack-cli subaccount:create \
  --business_name="Vendor Co" \
  --settlement_bank=033 \
  --account_number=0123456789 \
  --percentage_charge=15

# With contact details
paystack-cli subaccount:create \
  --business_name="Vendor Co" \
  --settlement_bank=033 \
  --account_number=0123456789 \
  --percentage_charge=10 \
  --primary_contact_email=vendor@example.com \
  --primary_contact_name="John Doe" \
  --primary_contact_phone=+2348012345678

# With description and metadata
paystack-cli subaccount:create \
  --business_name="Marketplace Vendor" \
  --settlement_bank=058 \
  --account_number=0123456789 \
  --percentage_charge=20 \
  --description="Online marketplace vendor account" \
  --metadata='{"vendor_id":"V001","tier":"premium"}'
```

## List Subaccounts

Get all subaccounts.

```bash
paystack-cli subaccount:list
```

### Optional Parameters

- `--perPage` - Records per page
- `--page` - Page number
- `--from` - Start date (YYYY-MM-DD)
- `--to` - End date (YYYY-MM-DD)

### Examples

```bash
# List all subaccounts
paystack-cli subaccount:list

# With pagination
paystack-cli subaccount:list --perPage=50 --page=1

# Filter by date
paystack-cli subaccount:list \
  --from=2026-01-01 \
  --to=2026-01-31
```

## Fetch Subaccount

Get subaccount details.

```bash
paystack-cli subaccount:fetch --code=ACCT_xxx
```

### Parameters

- `--code` - Subaccount code (required)

## Update Subaccount

Update subaccount information.

```bash
paystack-cli subaccount:update \
  --code=ACCT_xxx \
  --percentage_charge=15
```

### Required Parameters

- `--code` - Subaccount code

### Optional Parameters

- `--business_name` - Business name
- `--settlement_bank` - Bank code
- `--account_number` - Account number
- `--percentage_charge` - Percentage charge
- `--description` - Description
- `--primary_contact_email` - Contact email
- `--primary_contact_name` - Contact name
- `--primary_contact_phone` - Contact phone

### Examples

```bash
# Update percentage
paystack-cli subaccount:update \
  --code=ACCT_xxx \
  --percentage_charge=20

# Update contact details
paystack-cli subaccount:update \
  --code=ACCT_xxx \
  --primary_contact_email=newemail@example.com \
  --primary_contact_phone=+2348098765432

# Update account details
paystack-cli subaccount:update \
  --code=ACCT_xxx \
  --business_name="Updated Business Name" \
  --settlement_bank=044 \
  --account_number=0987654321
```

## Common Workflows

### Marketplace Split Payments

```bash
# 1. Create subaccount for vendor
paystack-cli subaccount:create \
  --business_name="Vendor Store" \
  --settlement_bank=033 \
  --account_number=0123456789 \
  --percentage_charge=80 \
  --primary_contact_email=vendor@example.com

# Save subaccount code (e.g., ACCT_xxx)

# 2. Initialize transaction with split
paystack-cli transaction:initialize \
  --email=customer@example.com \
  --amount=100000 \
  --subaccount=ACCT_xxx \
  --transaction_charge=2000 \
  --bearer=account

# Result:
# - Vendor receives 80% = 80,000
# - Platform receives 20% - fee = ~18,000
```

### Platform Fee Models

**Model 1: Flat Fee**

```bash
# Platform takes flat 2000 (20 NGN)
paystack-cli transaction:initialize \
  --email=customer@example.com \
  --amount=100000 \
  --subaccount=ACCT_xxx \
  --transaction_charge=2000 \
  --bearer=subaccount

# Subaccount bears Paystack fees
# Platform gets fixed 2000
```

**Model 2: Percentage Split**

```bash
# Subaccount gets 85%, platform gets 15%
paystack-cli subaccount:create \
  --business_name="Vendor" \
  --settlement_bank=033 \
  --account_number=0123456789 \
  --percentage_charge=85

paystack-cli transaction:initialize \
  --email=customer@example.com \
  --amount=100000 \
  --subaccount=ACCT_xxx \
  --bearer=account

# Subaccount: 85,000
# Platform: 15,000 - Paystack fees
```

### Update Vendor Commission

```bash
# List current subaccounts
paystack-cli subaccount:list

# Update commission rate
paystack-cli subaccount:update \
  --code=ACCT_xxx \
  --percentage_charge=90

# Verify update
paystack-cli subaccount:fetch --code=ACCT_xxx
```

## Bearer Options

### `--bearer=account`

Platform (main account) bears Paystack transaction fees.

```bash
paystack-cli transaction:initialize \
  --email=customer@example.com \
  --amount=100000 \
  --subaccount=ACCT_xxx \
  --transaction_charge=2000 \
  --bearer=account
```

### `--bearer=subaccount`

Subaccount bears Paystack transaction fees.

```bash
paystack-cli transaction:initialize \
  --email=customer@example.com \
  --amount=100000 \
  --subaccount=ACCT_xxx \
  --transaction_charge=2000 \
  --bearer=subaccount
```

## Settlement

Settlements to subaccounts happen automatically according to your settlement schedule. The subaccount percentage is calculated from the settled amount (after Paystack fees if bearer=account).

## Next Steps

- [Transactions API](/api/transactions)
- [Settlements API](/api/settlements)
- [Transfer Recipients API](/api/transfer-recipients)
