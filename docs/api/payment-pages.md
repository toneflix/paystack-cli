# Payment Pages API

Create hosted payment pages for collecting payments.

## Available Commands

| Command       | Description             |
| ------------- | ----------------------- |
| `page:create` | Create a payment page   |
| `page:list`   | List all payment pages  |
| `page:fetch`  | Fetch page details      |
| `page:update` | Update a payment page   |
| `page:check`  | Check slug availability |

## Create Payment Page

Create a hosted payment page.

```bash
paystack-cli page:create \
  --name="Product Page" \
  --description="Payment for our product"
```

### Required Parameters

- `--name` - Page name
- `--description` - Page description

### Optional Parameters

- `--amount` - Fixed amount in kobo
- `--slug` - Custom URL slug
- `--redirect_url` - URL to redirect after payment
- `--custom_fields` - JSON array of custom fields
- `--metadata` - Custom metadata JSON

### Examples

```bash
# Basic page
paystack-cli page:create \
  --name="Donation Page" \
  --description="Support our cause"

# With fixed amount
paystack-cli page:create \
  --name="Product Purchase" \
  --description="Buy our premium product" \
  --amount=50000

# With custom slug
paystack-cli page:create \
  --name="Event Tickets" \
  --description="Get your event tickets" \
  --slug=event-2026

# With redirect URL
paystack-cli page:create \
  --name="Checkout" \
  --description="Complete your purchase" \
  --amount=100000 \
  --redirect_url=https://mysite.com/thank-you

# With custom fields
paystack-cli page:create \
  --name="Registration" \
  --description="Event registration" \
  --amount=25000 \
  --custom_fields='[
    {"display_name":"Phone Number","variable_name":"phone_number","value":"","type":"text"},
    {"display_name":"T-Shirt Size","variable_name":"tshirt_size","value":"","type":"select","options":["S","M","L","XL"]}
  ]'
```

## List Payment Pages

Get all payment pages.

```bash
paystack-cli page:list
```

### Optional Parameters

- `--perPage` - Records per page
- `--page` - Page number
- `--from` - Start date
- `--to` - End date

### Examples

```bash
# List all pages
paystack-cli page:list

# With pagination
paystack-cli page:list --perPage=50 --page=1

# Export to JSON
paystack-cli page:list --json > payment-pages.json
```

## Fetch Payment Page

Get payment page details including transactions.

```bash
paystack-cli page:fetch --code=PAGE_xxx
```

### Parameters

- `--code` - Page code (required)

## Update Payment Page

Update an existing payment page.

```bash
paystack-cli page:update \
  --code=PAGE_xxx \
  --name="Updated Page Name"
```

### Required Parameters

- `--code` - Page code

### Optional Parameters

- `--name` - Page name
- `--description` - Description
- `--amount` - Amount in kobo
- `--active` - Active status (true/false)

### Examples

```bash
# Update name and description
paystack-cli page:update \
  --code=PAGE_xxx \
  --name="New Product Name" \
  --description="Updated description"

# Change amount
paystack-cli page:update \
  --code=PAGE_xxx \
  --amount=75000

# Deactivate page
paystack-cli page:update \
  --code=PAGE_xxx \
  --active=false

# Reactivate page
paystack-cli page:update \
  --code=PAGE_xxx \
  --active=true
```

## Check Slug Availability

Verify if a slug is available.

```bash
paystack-cli page:check --slug=my-product
```

### Parameters

- `--slug` - Desired slug (required)

### Response

```json
{
  "status": true,
  "message": "Slug is available"
}
```

Always check slug availability before creating a page with a custom slug.

## Common Workflows

### Create Product Page

```bash
# 1. Check slug availability
paystack-cli page:check --slug=premium-product

# 2. Create page
paystack-cli page:create \
  --name="Premium Product" \
  --description="Access to premium features" \
  --amount=99000 \
  --slug=premium-product \
  --redirect_url=https://mysite.com/welcome

# 3. Note the page URL from response
# https://paystack.com/pay/premium-product

# 4. Share URL with customers
```

### Donation Page

```bash
# Allow donors to choose amount
paystack-cli page:create \
  --name="Support Our Cause" \
  --description="Your donation helps us make a difference" \
  --slug=donate \
  --redirect_url=https://mysite.com/thank-you

# URL: https://paystack.com/pay/donate
```

### Event Registration

```bash
# Create page with custom fields
paystack-cli page:create \
  --name="Tech Conference 2026" \
  --description="Register for our annual conference" \
  --amount=50000 \
  --slug=techconf2026 \
  --custom_fields='[
    {"display_name":"Full Name","variable_name":"full_name","value":"","type":"text"},
    {"display_name":"Company","variable_name":"company","value":"","type":"text"},
    {"display_name":"Ticket Type","variable_name":"ticket_type","value":"","type":"select","options":["Regular","VIP","Student"]},
    {"display_name":"Dietary Requirements","variable_name":"dietary","value":"","type":"textarea"}
  ]'
```

### Update Active Pages

```bash
# List all pages
paystack-cli page:list

# Update specific page
paystack-cli page:update \
  --code=PAGE_xxx \
  --amount=120000 \
  --description="Updated pricing and features"

# Check updated details
paystack-cli page:fetch --code=PAGE_xxx
```

### Seasonal Promotion

```bash
# Create temporary promo page
paystack-cli page:create \
  --name="Black Friday Sale" \
  --description="Limited time offer" \
  --amount=39900 \
  --slug=black-friday-2026

# After promotion ends
paystack-cli page:update \
  --code=PAGE_xxx \
  --active=false
```

## Custom Fields Types

### Text Field

```json
{
  "display_name": "Field Label",
  "variable_name": "field_name",
  "value": "",
  "type": "text"
}
```

### Select Dropdown

```json
{
  "display_name": "Choose Option",
  "variable_name": "option",
  "value": "",
  "type": "select",
  "options": ["Option 1", "Option 2", "Option 3"]
}
```

### Textarea

```json
{
  "display_name": "Comments",
  "variable_name": "comments",
  "value": "",
  "type": "textarea"
}
```

## URL Structure

Payment pages are accessible at:

```sh
https://paystack.com/pay/{slug}
```

Or

```sh
https://paystack.com/pay/{page_code}
```

## Next Steps

- [Payment Requests API](/api/payment-requests)
- [Transactions API](/api/transactions)
- [Customers API](/api/customers)
