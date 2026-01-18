# Banks API

Get bank information and verify account details.

## Available Commands

| Command        | Description                       |
| -------------- | --------------------------------- |
| `bank:list`    | List available banks              |
| `bank:resolve` | Resolve and verify account number |

## List Banks

Get all available banks for a country.

```bash
paystack-cli bank:list --country=nigeria
```

### Parameters

- `--country` - Country name (nigeria, ghana, south africa) (required)

### Optional Parameters

- `--use_cursor` - Use cursor for pagination (true/false)
- `--perPage` - Records per page
- `--pay_with_bank_transfer` - Filter banks supporting bank transfers
- `--pay_with_bank` - Filter banks supporting direct debit
- `--enabled_for_verification` - Filter banks supporting verification

### Examples

```bash
# List Nigerian banks
paystack-cli bank:list --country=nigeria

# List Ghanaian banks
paystack-cli bank:list --country=ghana

# List South African banks
paystack-cli bank:list --country="south africa"

# Filter banks supporting bank transfers
paystack-cli bank:list \
  --country=nigeria \
  --pay_with_bank_transfer=true

# Export to JSON
paystack-cli bank:list --country=nigeria --json > banks.json
```

### Response

```json
{
  "status": true,
  "message": "Banks retrieved",
  "data": [
    {
      "id": 1,
      "name": "Access Bank",
      "slug": "access-bank",
      "code": "044",
      "active": true,
      "country": "Nigeria",
      "currency": "NGN",
      "type": "nuban"
    }
    // ... more banks
  ]
}
```

## Resolve Account

Verify account number and get account name.

```bash
paystack-cli bank:resolve \
  --account_number=0123456789 \
  --bank_code=033
```

### Parameters

- `--account_number` - Bank account number (required)
- `--bank_code` - Bank code (required)

### Examples

```bash
# Resolve Nigerian account
paystack-cli bank:resolve \
  --account_number=0123456789 \
  --bank_code=033

# Resolve before creating recipient
paystack-cli bank:resolve \
  --account_number=0123456789 \
  --bank_code=033 \
  && paystack-cli transferrecipient:create \
     --type=nuban \
     --name="Returned Account Name" \
     --account_number=0123456789 \
     --bank_code=033
```

### Response

```json
{
  "status": true,
  "message": "Account number resolved",
  "data": {
    "account_number": "0123456789",
    "account_name": "JOHN DOE",
    "bank_id": 9
  }
}
```

**Note**: Always verify the account name matches your intended recipient before creating a transfer recipient or initiating a transfer.

## Common Workflows

### Verify Before Transfer

```bash
# 1. List banks to get code
paystack-cli bank:list --country=nigeria | grep "Access Bank"

# 2. Resolve account
paystack-cli bank:resolve \
  --account_number=0123456789 \
  --bank_code=044

# 3. Verify account name matches

# 4. Create recipient
paystack-cli transferrecipient:create \
  --type=nuban \
  --name="JOHN DOE" \
  --account_number=0123456789 \
  --bank_code=044

# 5. Initiate transfer
paystack-cli transfer:initiate \
  --source=balance \
  --amount=50000 \
  --recipient=RCP_xxx
```

### Find Bank Code

```bash
# Search for specific bank
paystack-cli bank:list --country=nigeria --json | \
  jq '.data[] | select(.name | contains("Access"))'

# Get just bank codes and names
paystack-cli bank:list --country=nigeria --json | \
  jq '.data[] | {name: .name, code: .code}'
```

## Bank Codes (Common)

### Nigeria

| Bank          | Code |
| ------------- | ---- |
| Access Bank   | 044  |
| GTBank        | 058  |
| UBA           | 033  |
| Zenith Bank   | 057  |
| First Bank    | 011  |
| Fidelity Bank | 070  |
| Stanbic IBTC  | 221  |
| Sterling Bank | 232  |
| Union Bank    | 032  |
| Wema Bank     | 035  |

### Ghana

| Provider         | Code |
| ---------------- | ---- |
| MTN Mobile Money | MTN  |
| Vodafone         | VOD  |
| AirtelTigo       | ATL  |

**Tip**: Always use `bank:list` to get the most current list of supported banks and their codes.

## Error Handling

### "Could not resolve account name"

**Causes**:

- Invalid account number
- Incorrect bank code
- Account doesn't exist
- Bank API temporarily unavailable

**Solution**: Double-check account number and bank code, then try again.

### "Account number could not be verified"

**Causes**:

- Account not eligible for transfers
- Bank doesn't support verification
- Account is inactive

**Solution**: Contact the account owner to verify details or use a different account.

## Next Steps

- [Transfer Recipients API](/api/transfer-recipients)
- [Transfers API](/api/transfers)
- [Verifications API](/api/verifications)
