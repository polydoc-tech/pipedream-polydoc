# PolyDoc example workflows

Three starter workflows, one per use-case angle, mirroring the n8n connector's
template set. Pipedream workflows are built in the UI rather than imported from a
file, so each example below lists the trigger, the PolyDoc action, and the props
to set. The same three will be published as shareable Pipedream workflow templates
once the `polydoc` app is registered (see `../ROADMAP.md`).

| Angle | Example | Trigger | Action |
| --- | --- | --- | --- |
| Screenshot | [Scheduled URL screenshot](./scheduled-url-screenshot.md) | Schedule | Capture Screenshot |
| PDF | [Invoice PDF from template data](./invoice-pdf-from-template.md) | Manual / Sheets / Webhook | Convert to PDF |
| E-Invoice | [E-Invoice from a webhook](./einvoice-webhook-to-pdf.md) | HTTP / Webhook | Generate E-Invoice |

Every example uses the connected PolyDoc account; turn on the account's Sandbox
toggle while testing to avoid spending production quota (output is watermarked).
