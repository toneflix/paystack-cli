# Transfers API

Send money to bank accounts in Nigeria, Ghana, and South Africa.

## Available Commands

| Command             | Description                |
| ------------------- | -------------------------- |
| `transfer:initiate` | Initiate a transfer        |
| `transfer:finalize` | Complete transfer with OTP |
| `transfer:list`     | List all transfers         |
| `transfer:fetch`    | Fetch transfer details     |
| `transfer:verify`   | Verify transfer status     |
| `transfer:disable`  | Disable OTP requirement    |
| `transfer:enable`   | Enable OTP requirement     |
| `transfer:resend`   | Resend transfer OTP        |

## Initiate Transfer

Start a new transfer to a bank account.

```bash
paystack-cli transfer:initiate \
  --source=balance \
  --amount=50000 \
  --recipient=RCP_xxx \
  --reason="Payment for services"
```

### Required Parameters

- `--source` - Source of funds (balance)
- `--amount` - Amount in kobo
- `--recipient` - Recipient code

### Optional Parameters

- `--reason` - Transfer description
- `--currency` - Currency (NGN, GHS, ZAR)
- `--reference` - Unique transfer reference

### Examples

```bash
# Basic transfer
paystack-cli transfer:initiate \
  --source=balance \
  --amount=50000 \
  --recipient=RCP_xxx

# With custom reference
paystack-cli transfer:initiate \
  --source=balance \
  --amount=50000 \
  --recipient=RCP_xxx \
  --reference=PAY_001 \
  --reason="Invoice payment #001"

# Bulk transfer
paystack-cli transfer:initiate \
  --transfers='[
    {"amount":10000,"recipient":"RCP_1","reference":"REF_1"},
    {"amount":20000,"recipient":"RCP_2","reference":"REF_2"}
  ]'
```

## Finalize Transfer

Complete a transfer using OTP.

```bash
paystack-cli transfer:finalize \
  --transfer_code=TRF_xxx \
  --otp=123456
```

### Parameters

- `--transfer_code` - Transfer code (required)
- `--otp` - One-time password from email (required)

## List Transfers

Get all transfers.

```bash
paystack-cli transfer:list
```

### Optional Parameters

- `--perPage` - Records per page
- `--page` - Page number
- `--customer` - Filter by customer
- `--from` - Start date (YYYY-MM-DD)
- `--to` - End date (YYYY-MM-DD)

### Examples

```bash
# List all transfers
paystack-cli transfer:list

# Filter by date range
paystack-cli transfer:list \
  --from=2026-01-01 \
  --to=2026-01-31

# With pagination
paystack-cli transfer:list --perPage=100 --page=1
```

## Fetch Transfer

Get transfer details.

```bash
paystack-cli transfer:fetch --code=TRF_xxx
```

### Parameters

- `--code` - Transfer code (required)

## Verify Transfer

Verify transfer status.

```bash
paystack-cli transfer:verify --reference=REF_xxx
```

### Parameters

- `--reference` - Transfer reference (required)

## Disable OTP

Disable OTP requirement for transfers (required for bulk transfers).

```bash
paystack-cli transfer:disable
```

**Note**: Only disable OTP when necessary. Re-enable after bulk operations.

## Enable OTP

Re-enable OTP requirement.

```bash
paystack-cli transfer:enable
```

## Resend OTP

Request a new OTP for a transfer.

```bash
paystack-cli transfer:resend \
  --transfer_code=TRF_xxx \
  --reason=resend_otp
```

### Parameters

- `--transfer_code` - Transfer code (required)
- `--reason` - Reason (resend_otp) (required)

## Common Workflows

### Single Transfer

```bash
# 1. Create recipient (see Transfer Recipients API)
paystack-cli transferrecipient:create \
  --type=nuban \
  --name="John Doe" \
  --account_number=0123456789 \
  --bank_code=033

# 2. Initiate transfer
paystack-cli transfer:initiate \
  --source=balance \
  --amount=50000 \
  --recipient=RCP_xxx \
  --reason="Payment"

# 3. Get OTP from email

# 4. Finalize transfer
paystack-cli transfer:finalize \
  --transfer_code=TRF_xxx \
  --otp=123456

# 5. Verify completion
paystack-cli transfer:verify --reference=TRF_xxx
```

### Bulk Transfers

```bash
# 1. Disable OTP
paystack-cli transfer:disable

# 2. Create recipients

# 3. Initiate bulk transfer
paystack-cli transfer:initiate \
  --transfers='[
    {"amount":10000,"recipient":"RCP_1","reference":"PAY_001"},
    {"amount":20000,"recipient":"RCP_2","reference":"PAY_002"},
    {"amount":15000,"recipient":"RCP_3","reference":"PAY_003"}
  ]'

# 4. Re-enable OTP
paystack-cli transfer:enable
```

## Next Steps

- [Transfer Recipients API](/api/transfer-recipients)
- [Banks API](/api/banks)
- [Balance API](/api/balance)
