# pipedream-polydoc

The [PolyDoc](https://polydoc.tech) connector for [Pipedream](https://pipedream.com):
convert HTML or a URL to PDF, capture screenshots, and generate EU e-invoices
(Factur-X / ZUGFeRD). One app, four actions.

This repo is the source of truth for the registry component. The
`components/polydoc/` folder is laid out exactly as it sits in the
`PipedreamHQ/pipedream` monorepo, so it can be copied straight into a fork for the
registry PR. Dev tooling (tests, eslint) lives at the repo root.

## Actions

| Action | Endpoint | Output |
| --- | --- | --- |
| Convert to PDF | `POST /pdf/convert` | PDF |
| Capture Screenshot | `POST /screenshot/convert` | PNG / JPEG / WebP |
| Generate E-Invoice | `POST /pdf/convert` (with `eInvoice`) | ZUGFeRD / Factur-X hybrid PDF/A-3 |
| Test Connection | `POST /screenshot/convert` (sandbox) | Validates the API key |

Each conversion action shares the same building blocks:

- **Source**: a URL, an inline HTML string, or a saved template (`Template ID` +
  `Template Data`).
- **Delivery**: `Download` (default; the file is written to `/tmp` and the step
  returns its `path` plus metadata), `Cloud Storage` (upload to a presigned URL,
  returns JSON), or `Webhook` (deliver to a URL).
- **Advanced (JSON)**: a raw object deep-merged into the request body, so any API
  field not surfaced as a prop (for example `pdf.watermark`, `pdf.pdfa`, `render`,
  `request`) is still reachable. Advanced values win on conflict.

The screenshot action additionally offers `Output Encoding` = `Base64` to return
the image as a base64 string instead of a file (the PolyDoc API supports base64
for screenshots only).

## Credentials

The PolyDoc app authenticates with an API key (create one at
[dashboard.polydoc.tech](https://dashboard.polydoc.tech)). Run the **Test
Connection** action to confirm a key works; it uses a tiny forced-sandbox
screenshot so it never spends production quota.

Each conversion action has a `Sandbox` toggle (off by default). Turn it on to send
that run to the sandbox (`X-Sandbox: true`): watermarked output that does not spend
production quota, handy while building a workflow.

## Example workflows

Three starter workflows, one per angle, are documented under
[`examples/`](./examples/): a scheduled URL screenshot, an invoice PDF from
template data, and an e-invoice from a webhook.

## Development

```bash
npm install
npm test            # unit + action-wiring tests (offline)
npm run lint        # Pipedream component conformance (eslint)
```

Live sandbox smoke tests are gated on an API key and skip without it:

```bash
POLYDOC_API_KEY=your_sandbox_key npm run test:integration
```

They force `X-Sandbox: true`, so they draw sandbox quota only. Conversions can take
a while on a cold sandbox; the test timeout is set generously.

### Tests

- `test/build-request-body.test.mjs` locks the request-body shape (ported from the
  n8n connector's unit tests).
- `test/actions.test.mjs` drives each action with a stubbed HTTP boundary to verify
  prop -> body -> output wiring.
- `test/integration.test.mjs` hits the live sandbox API and checks real PDF / PNG /
  e-invoice output.

### Notes

- `eslint` reports `default-value-required-for-optional-props` warnings for the
  conditional props (URL vs HTML vs Template, delivery subfields). These are
  advisory; those props have no sensible default and are validated at runtime.
- The `polydoc` app's API-key auth must be registered on Pipedream's platform
  before the component can connect an account in the UI. See [ROADMAP.md](./ROADMAP.md).

## License

MIT
