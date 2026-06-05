# Invoice PDF from template data

Render a PDF from a template you saved in PolyDoc, filling it with data from an
upstream step (a Google Sheets row, a webhook, a database query).

## Steps

1. **Trigger:** anything that carries the invoice data. Start with a Manual trigger
   to test, then swap in Google Sheets (New Row), a Webhook, or a DB query.
2. **Action: PolyDoc - Convert to PDF**
   - Connect your PolyDoc account.
   - Source Type: `Template`
   - Template ID: your saved template, for example `jlE-whg`
   - Template Data (object):
     ```json
     {
       "invoice_number": "INV-001",
       "invoice_date": "2026-01-31",
       "customer_name": "Customer SARL",
       "items": [
         { "name": "Widget", "description": "Blue widget", "quantity": 2, "price": 10 }
       ]
     }
     ```
     Map these from the trigger step (for example `{{steps.trigger.event.body.invoice_number}}`).
   - Page Format: `A4`, Print Background: `true`
   - Filename: `invoice.pdf`
   - Delivery Mode: `Download`
3. **Next step:** the PDF lands at `/tmp/invoice.pdf`; pass `path` to Gmail, S3,
   Google Drive, etc.

## Notes

- No saved template yet? Set Source Type to `HTML` and pass an inline HTML string
  instead.
- The Advanced (JSON) field accepts any API option not shown, for example a
  watermark or PDF metadata: `{ "pdf": { "metadata": { "title": "Invoice INV-001" } } }`.

Start free: https://polydoc.tech/?utm_source=pipedream&utm_medium=template&utm_campaign=invoice-pdf
