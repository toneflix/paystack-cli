# Transfer Recipients API

Manage bank account recipients for transfers.

## Available Commands

| Command                    | Description                 |
| -------------------------- | --------------------------- |
| `transferrecipient:create` | Create a transfer recipient |
| `transferrecipient:bulk`   | Create multiple recipients  |
| `transferrecipient:list`   | List all recipients         |
| `transferrecipient:fetch`  | Fetch recipient details     |
| `transferrecipient:update` | Update recipient            |
| `transferrecipient:delete` | Delete recipient            |

## Create Recipient

Add a bank account for transfers.

```bash
paystack-cli transferrecipient:create \
  --type=nuban \
  --name="John Doe" \
  --account_number=0123456789 \
  --bank_code=033
```

### Required Parameters

- `--type` - Account type (nuban, mobile_money, basa, authorization)
- `--name` - Account holder name
- `--account_number` - Account number (for nuban/mobile_money)
- `--bank_code` - Bank code (for nuban)

### Optional Parameters

- `--description` - Recipient description
- `--currency` - Currency (NGN, GHS, ZAR)
- `--authorization_code` - Auth code (for authorization type)
- `--metadata` - Custom metadata JSON

### Examples

```bash
# Nigerian bank account
paystack-cli transferrecipient:create \
  --type=nuban \
  --name="John Doe" \
  --account_number=0123456789 \
  --bank_code=033 \
  --currency=NGN

# Mobile money (Ghana)
paystack-cli transferrecipient:create \
  --type=mobile_money \
  --name="Jane Doe" \
  --account_number=0241234567 \
  --bank_code=MTN \
  --currency=GHS

# With metadata
paystack-cli transferrecipient:create \
  --type=nuban \
  --name="Vendor Co" \
  --account_number=0123456789 \
  --bank_code=033 \
  --description="Monthly vendor payment" \
  --metadata='{"vendor_id":"V001"}'
```

## Create Bulk Recipients

Create multiple recipients at once.

```bash
paystack-cli transferrecipient:bulk \
  --batch='[
    {"type":"nuban","name":"Recipient 1","account_number":"0123456789","bank_code":"033"},
    {"type":"nuban","name":"Recipient 2","account_number":"0987654321","bank_code":"058"}
  ]'
```

### Parameters

- `--batch` - JSON array of recipient objects (required)

## List Recipients

Get all transfer recipients.

```bash
paystack-cli transferrecipient:list
```

### Optional Parameters

- `--perPage` - Records per page
- `--page` - Page number
- `--from` - Start date
- `--to` - End date

### Examples

```bash
# List all
paystack-cli transferrecipient:list

# With pagination
paystack-cli transferrecipient:list --perPage=100 --page=1

# Export to JSON
paystack-cli transferrecipient:list --json > recipients.json
```

## Fetch Recipient

Get recipient details.

```bash
paystack-cli transferrecipient:fetch --code=RCP_xxx
```

### Parameters

- `--code` - Recipient code (required)

## Update Recipient

Update recipient information.

```bash
paystack-cli transferrecipient:update \
  --code=RCP_xxx \
  --name="Updated Name"
```

### Required Parameters

- `--code` - Recipient code

### Optional Parameters

- `--name` - Account name
- `--email` - Email address

### Examples

```bash
# Update name
paystack-cli transferrecipient:update \
  --code=RCP_xxx \
  --name="New Account Name"

# Update email
paystack-cli transferrecipient:update \
  --code=RCP_xxx \
  --email=newemail@example.com
```

## Delete Recipient

Remove a transfer recipient.

```bash
paystack-cli transferrecipient:delete --code=RCP_xxx
```

### Parameters

- `--code` - Recipient code (required)

## Common Workflows

### Add and Verify Recipient

```bash
# 1. Get bank list
paystack-cli bank:list --country=nigeria

# 2. Resolve account details
paystack-cli bank:resolve \
  --account_number=0123456789 \
  --bank_code=033

# 3. Create recipient
paystack-cli transferrecipient:create \
  --type=nuban \
  --name="John Doe" \
  --account_number=0123456789 \
  --bank_code=033

# 4. Use recipient for transfer
paystack-cli transfer:initiate \
  --source=balance \
  --amount=50000 \
  --recipient=RCP_xxx
```

### Manage Multiple Recipients

```bash
# 1. Create recipients in bulk
paystack-cli transferrecipient:bulk \
  --batch='[
    {"type":"nuban","name":"Vendor 1","account_number":"0123456789","bank_code":"033"},
    {"type":"nuban","name":"Vendor 2","account_number":"0987654321","bank_code":"058"}
  ]'

# 2. List all recipients
paystack-cli transferrecipient:list --perPage=100

# 3. Update specific recipient
paystack-cli transferrecipient:update \
  --code=RCP_xxx \
  --name="Updated Vendor Name"

# 4. Delete old recipient
paystack-cli transferrecipient:delete --code=RCP_old
```

## Next Steps

- [Transfers API](/api/transfers)
- [Banks API](/api/banks)
- [Balance API](/api/balance)
