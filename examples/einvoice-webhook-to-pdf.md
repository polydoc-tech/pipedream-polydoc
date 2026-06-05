# E-Invoice from a webhook

Accept invoice JSON over HTTP and return a ZUGFeRD / Factur-X hybrid PDF/A-3
(EN 16931) e-invoice.

## Steps

1. **Trigger: HTTP / Webhook** - receive a POST with the invoice fields in the body.
2. **Action: PolyDoc - Generate E-Invoice**
   - Connect your PolyDoc account.
   - Source Type: `HTML` (the visual layer), for example
     `<h1>Invoice {{steps.trigger.event.body.number}}</h1>`
   - Standard: `ZUGFeRD` (or `Factur-X`)
   - Profile: `en16931`
   - Verify: `true`
   - Invoice (object): the EN 16931 payload. A valid minimum:
     ```json
     {
       "number": "INV-PD-001",
       "issueDate": "2026-01-15",
       "dueDate": "2026-02-15",
       "currencyCode": "EUR",
       "seller": {
         "name": "Northwind Studio",
         "address": { "line1": "1 Studio Way", "city": "Berlin", "postalCode": "10115", "countryCode": "DE" },
         "taxId": "DE123456789"
       },
       "buyer": {
         "name": "Contoso GmbH",
         "address": { "line1": "5 Market St", "city": "Munich", "postalCode": "80331", "countryCode": "DE" }
       },
       "lines": [
         { "description": "Design services", "quantity": 10, "unitPrice": 100, "lineTotal": 1000, "vatRate": 19, "vatCategoryCode": "S" }
       ],
       "taxSummary": [
         { "categoryCode": "S", "rate": 19, "taxableAmount": 1000, "taxAmount": 190 }
       ],
       "paymentTerms": "Net 30 days",
       "totalNetAmount": 1000,
       "totalTaxAmount": 190,
       "totalGrossAmount": 1190
     }
     ```
   - Delivery Mode: `Download`
3. **Return the PDF:** add a Return HTTP Response step and send the file from
   `/tmp/document.pdf`.

## Validation tips (EN 16931)

- Include `dueDate` or `paymentTerms` (rule BR-CO-25), or you get a 422.
- Add a seller `taxId` when any line uses VAT category `S`.
- Keep totals consistent: `totalNetAmount + totalTaxAmount = totalGrossAmount`.
- A `taxSummary` is recommended for clean validation.

Start free: https://polydoc.tech/?utm_source=pipedream&utm_medium=template&utm_campaign=einvoice
