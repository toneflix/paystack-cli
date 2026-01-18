# Examples

Real-world examples and workflows using Paystack CLI.

## Complete Transaction Flow

Process a payment from initialization to verification:

```bash
# 1. Initialize transaction
paystack-cli transaction:initialize \
  --email=customer@example.com \
  --amount=50000 \
  --reference=ORDER_12345

# Response will include authorization_url and access_code
# Direct customer to authorization_url to complete payment

# 2. After customer pays, verify transaction
paystack-cli transaction:verify --reference=ORDER_12345

# 3. View complete transaction details
paystack-cli transaction:view --id=123456
```

## Subscription Management

Complete workflow for setting up recurring payments:

```bash
# 1. Create a subscription plan
paystack-cli plan:create \
  --name="Monthly Premium" \
  --amount=50000 \
  --interval=monthly \
  --send_invoices=true

# Save the plan code from response (e.g., PLN_xxx)

# 2. Create or fetch customer
paystack-cli customer:create \
  --email=subscriber@example.com \
  --first_name=John \
  --last_name=Doe

# Save the customer code from response (e.g., CUS_xxx)

# 3. Create subscription
paystack-cli subscription:create \
  --customer=CUS_xxx \
  --plan=PLN_xxx

# 4. List all subscriptions for a customer
paystack-cli subscription:list --customer=CUS_xxx

# 5. Disable a subscription (if needed)
paystack-cli subscription:disable \
  --code=SUB_xxx \
  --token=email_token_from_email
```

## Transfer Workflow

Send money to a bank account:

```bash
# 1. Get list of banks
paystack-cli bank:list --country=nigeria

# 2. Resolve and verify account number
paystack-cli bank:resolve \
  --account_number=0123456789 \
  --bank_code=033

# Account details will be returned for verification

# 3. Create transfer recipient
paystack-cli transferrecipient:create \
  --type=nuban \
  --name="Jane Doe" \
  --account_number=0123456789 \
  --bank_code=033

# Save recipient code (e.g., RCP_xxx)

# 4. Initiate transfer
paystack-cli transfer:initiate \
  --source=balance \
  --amount=50000 \
  --recipient=RCP_xxx \
  --reason="Payment for services"

# 5. If OTP is required, you'll receive it via email
# Finalize transfer with OTP
paystack-cli transfer:finalize \
  --transfer_code=TRF_xxx \
  --otp=123456

# 6. Verify transfer status
paystack-cli transfer:verify --reference=TRF_xxx
```

## Bulk Transfers

Send money to multiple recipients at once:

```bash
# 1. Disable OTP (required for bulk transfers)
paystack-cli transfer:disable

# 2. Create multiple recipients (repeat for each)
paystack-cli transferrecipient:create \
  --type=nuban \
  --name="Recipient 1" \
  --account_number=0123456789 \
  --bank_code=033

# 3. Initiate bulk transfer
paystack-cli transfer:initiate \
  --transfers='[
    {"amount":10000,"recipient":"RCP_xxx1","reference":"REF_001"},
    {"amount":20000,"recipient":"RCP_xxx2","reference":"REF_002"},
    {"amount":15000,"recipient":"RCP_xxx3","reference":"REF_003"}
  ]'

# 4. Re-enable OTP for security
paystack-cli transfer:enable
```

## Payment Pages

Create a payment page for donations or products:

```bash
# 1. Create payment page
paystack-cli page:create \
  --name="Product Donations" \
  --description="Support our cause" \
  --slug=donations

# Save the page code and URL from response

# 2. Update page details
paystack-cli page:update \
  --code=PAGE_xxx \
  --amount=5000

# 3. Check slug availability before creating
paystack-cli page:check --slug=my-product

# 4. List all pages
paystack-cli page:list
```

## Invoicing Workflow

Send invoices to customers:

```bash
# 1. Create customer (if not exists)
paystack-cli customer:create \
  --email=client@example.com \
  --first_name=Jane \
  --last_name=Smith

# 2. Create payment request (invoice)
paystack-cli paymentrequest:create \
  --customer=CUS_xxx \
  --amount=100000 \
  --description="Website development services" \
  --due_date=2026-02-28

# 3. Send invoice to customer
paystack-cli paymentrequest:send --code=PRQ_xxx

# 4. Check payment status
paystack-cli paymentrequest:verify --code=PRQ_xxx

# 5. View invoice details
paystack-cli paymentrequest:invoice --code=PRQ_xxx
```

## Refund Processing

Process refunds for transactions:

```bash
# 1. Find the transaction
paystack-cli transaction:list \
  --customer=CUS_xxx \
  --status=success

# 2. Create full refund
paystack-cli refund:create \
  --transaction=TRX_xxx

# 3. Create partial refund
paystack-cli refund:create \
  --transaction=TRX_xxx \
  --amount=5000 \
  --customer_note="Partial refund for cancelled item"

# 4. List all refunds
paystack-cli refund:list

# 5. Fetch refund details
paystack-cli refund:fetch --code=RFD_xxx
```

## Subaccount (Split Payments)

Set up split payments with subaccounts:

```bash
# 1. Create subaccount for vendor
paystack-cli subaccount:create \
  --business_name="Vendor Co" \
  --settlement_bank=033 \
  --account_number=0123456789 \
  --percentage_charge=10 \
  --primary_contact_email=vendor@example.com

# Save subaccount code (e.g., ACCT_xxx)

# 2. Initialize transaction with subaccount
paystack-cli transaction:initialize \
  --email=customer@example.com \
  --amount=100000 \
  --subaccount=ACCT_xxx \
  --transaction_charge=2000 \
  --bearer=account

# 3. Update subaccount details
paystack-cli subaccount:update \
  --code=ACCT_xxx \
  --percentage_charge=15

# 4. List all subaccounts
paystack-cli subaccount:list
```

## Customer Management

Manage customer information and authorizations:

```bash
# 1. Create customer
paystack-cli customer:create \
  --email=user@example.com \
  --first_name=John \
  --last_name=Doe \
  --phone=+2348012345678

# 2. Update customer details
paystack-cli customer:update \
  --code=CUS_xxx \
  --first_name=Jane \
  --metadata='{"user_id":12345,"tier":"premium"}'

# 3. Fetch customer with transactions
paystack-cli customer:fetch --code=CUS_xxx

# 4. Set risk action (whitelist/blacklist)
paystack-cli customer:set_risk_action \
  --customer=CUS_xxx \
  --risk_action=allow

# 5. Deactivate customer's card authorization
paystack-cli customer:deactivate \
  --authorization_code=AUTH_xxx
```

## Webhook Testing Example

Test webhooks locally during development:

```bash
# Terminal 1: Start your local server
npm run dev  # or your server command

# Terminal 2: Start webhook listener
paystack-cli webhook listen http://localhost:3000/webhook

# Terminal 3: Trigger webhook events
paystack-cli webhook ping --event=charge.success
paystack-cli webhook ping --event=transfer.success
paystack-cli webhook ping --event=subscription.create
```

## Batch Operations

Perform operations on multiple resources:

```bash
# List and export all transactions for a period
paystack-cli transaction:export \
  --from=2026-01-01 \
  --to=2026-01-31

# List all customers with pagination
paystack-cli customer:list --perPage=100 --page=1
paystack-cli customer:list --perPage=100 --page=2

# Get transaction totals for a period
paystack-cli transaction:transaction \
  --from=2026-01-01 \
  --to=2026-01-31
```

## Next Steps

- Explore the full [API Reference](/api/transactions)
- Learn about [Webhook Testing](/guide/webhook-testing)
- Check [Troubleshooting](/guide/troubleshooting) for common issues
