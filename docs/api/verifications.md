# Verifications API

Verify customer identity and account information.

## Available Commands

| Command                         | Description               |
| ------------------------------- | ------------------------- |
| `verification:resolve_account`  | Resolve account number    |
| `verification:validate_account` | Validate customer account |
| `verification:resolve_card_bin` | Get card details from BIN |

## Resolve Account Number

Verify bank account number and get account name.

```bash
paystack-cli verification:resolve_account \
  --account_number=0123456789 \
  --bank_code=033
```

### Parameters

- `--account_number` - Bank account number (required)
- `--bank_code` - Bank code (required)

### Examples

```bash
# Verify Nigerian bank account
paystack-cli verification:resolve_account \
  --account_number=0123456789 \
  --bank_code=044

# Verify before transfer
paystack-cli verification:resolve_account \
  --account_number=0123456789 \
  --bank_code=033 \
  --json
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

**Important**: Always verify the account name matches your intended recipient before transferring funds.

## Validate Customer Account

Validate customer identity information.

```bash
paystack-cli verification:validate_account \
  --account_name="John Doe" \
  --account_number=0123456789 \
  --account_type=personal \
  --bank_code=033 \
  --country_code=NG \
  --document_type=identityNumber \
  --document_number=12345678901
```

### Required Parameters

- `--account_name` - Account holder name
- `--account_number` - Account number
- `--account_type` - Account type (personal, business)
- `--bank_code` - Bank code
- `--country_code` - Country code (NG, GH, ZA)
- `--document_type` - Document type (identityNumber, passportNumber, businessRegistrationNumber)
- `--document_number` - Document number (e.g., BVN for Nigeria)

### Optional Parameters

- `--first_name` - First name
- `--last_name` - Last name
- `--middle_name` - Middle name

### Examples

```bash
# Validate with BVN (Nigeria)
paystack-cli verification:validate_account \
  --account_name="John Doe" \
  --account_number=0123456789 \
  --account_type=personal \
  --bank_code=044 \
  --country_code=NG \
  --document_type=identityNumber \
  --document_number=22123456789 \
  --first_name=John \
  --last_name=Doe

# Business account validation
paystack-cli verification:validate_account \
  --account_name="Tech Company Ltd" \
  --account_number=0123456789 \
  --account_type=business \
  --bank_code=044 \
  --country_code=NG \
  --document_type=businessRegistrationNumber \
  --document_number=RC123456
```

## Resolve Card BIN

Get card information from the first 6 digits (BIN).

```bash
paystack-cli verification:resolve_card_bin --bin=408408
```

### Parameters

- `--bin` - First 6 digits of card (required)

### Response

```json
{
  "status": true,
  "message": "BIN resolved",
  "data": {
    "bin": "408408",
    "brand": "visa",
    "sub_brand": "",
    "country_code": "NG",
    "country_name": "Nigeria",
    "card_type": "DEBIT",
    "bank": "Test Bank",
    "linked_bank_id": 9
  }
}
```

### Use Cases

- Validate card type before charging
- Display bank name during checkout
- Check if card is local or international
- Verify card brand (Visa, Mastercard, etc.)

### Examples

```bash
# Check card details
paystack-cli verification:resolve_card_bin --bin=539983

# Validate international card
paystack-cli verification:resolve_card_bin --bin=424242 --json | \
  jq '.data.country_code'

# Check card type (debit/credit)
paystack-cli verification:resolve_card_bin --bin=408408 --json | \
  jq '.data.card_type'
```

## Common Workflows

### Verify Before Creating Transfer Recipient

```bash
# 1. Resolve account to get account name
paystack-cli verification:resolve_account \
  --account_number=0123456789 \
  --bank_code=044

# 2. Verify account name matches

# 3. Create transfer recipient
paystack-cli transferrecipient:create \
  --type=nuban \
  --name="JOHN DOE" \
  --account_number=0123456789 \
  --bank_code=044

# 4. Initiate transfer
paystack-cli transfer:initiate \
  --source=balance \
  --amount=50000 \
  --recipient=RCP_xxx
```

### KYC Validation

```bash
# 1. Collect customer information
# 2. Validate account with BVN
paystack-cli verification:validate_account \
  --account_name="John Doe" \
  --account_number=0123456789 \
  --account_type=personal \
  --bank_code=044 \
  --country_code=NG \
  --document_type=identityNumber \
  --document_number=22123456789 \
  --first_name=John \
  --last_name=Doe

# 3. If validation passes, proceed with transaction
# 4. If validation fails, request customer to verify details
```

### Card Validation During Checkout

```bash
# When customer enters card number
# Extract BIN (first 6 digits)
BIN=$(echo "4084084084084081" | cut -c1-6)

# Resolve BIN
paystack-cli verification:resolve_card_bin --bin=$BIN

# Display bank name and card type to customer
# Validate if you accept that card type
```

### Bulk Account Verification

```bash
# Create account list file
cat > accounts.txt << 'EOF'
0123456789,044
0987654321,058
1122334455,033
EOF

# Verify each account
while IFS=, read -r account bank; do
  echo "Verifying $account at bank $bank"
  paystack-cli verification:resolve_account \
    --account_number=$account \
    --bank_code=$bank
  sleep 1  # Rate limiting
done < accounts.txt
```

## Verification for Different Countries

### Nigeria

- Use BVN (Bank Verification Number) as `identityNumber`
- BVN is 11 digits
- Required for account validation

### Ghana

- Use Ghana Card number as `identityNumber`
- Or passport number

### South Africa

- Use ID number or passport number

## Important Notes

### Account Resolution

- Always verify account name before transfers
- Account names are returned in UPPERCASE
- Names should match exactly (account name validation is strict)
- Resolution helps prevent sending money to wrong account

### BVN Validation (Nigeria)

- BVN is sensitive personal information
- Store securely if you must store it
- Only request when necessary for compliance
- Customers may be reluctant to share - explain why you need it

### Card BIN Resolution

- BIN only gives card issuer information
- Doesn't validate if card is active
- Doesn't check card balance
- Use for informational purposes only

### Rate Limiting

- Add delays between bulk verifications
- Don't verify same account repeatedly
- Cache verification results when appropriate

## Error Handling

### "Could not resolve account name"

- Account number may be invalid
- Bank code may be incorrect
- Account may be inactive
- Try again or verify details with customer

### "BVN validation failed"

- BVN may not match account
- BVN format may be incorrect (must be 11 digits)
- Name spelling may differ from BVN records
- Ask customer to verify their BVN

### "Invalid BIN"

- BIN must be exactly 6 digits
- BIN may not be in database (new card issue)
- Card may be from unsupported country

## Next Steps

- [Banks API](/api/banks) - Get bank codes
- [Transfer Recipients API](/api/transfer-recipients) - Create recipients
- [Transfers API](/api/transfers) - Send money
- [Customers API](/api/customers) - Manage customers
