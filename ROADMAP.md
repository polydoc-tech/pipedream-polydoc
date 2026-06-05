# pipedream-polydoc roadmap

PolyDoc connector for Pipedream, porting `n8n-nodes-polydoc` per
`../../CONNECTOR-PLAYBOOK.md`. The component lives under `components/polydoc/`,
laid out copy-paste-ready into the `PipedreamHQ/pipedream` registry.

## Done

Initial build pass complete and verified locally: the `polydoc` app, the pure body
builder, four actions, the output + params helpers, per-angle examples, and the
test + lint gates are all in place and green.

- [x] Scaffold repo (`tools/pipedream-polydoc/`), git init, root tooling, `.gitignore`.
- [x] `components/polydoc/package.json` + `common/constants.mjs`.
- [x] `common/build-request-body.mjs` (pure port of n8n `buildRequestBody` + helpers).
- [x] Unit tests `test/build-request-body.test.mjs` (ported 1:1 plus a base64 case), green.
- [x] `polydoc.app.mjs` (propDefinitions + `_baseUrl`/`_request`/`testConnection`).
- [x] `common/output.mjs` (/tmp write, base64, JSON passthrough, error extraction) + `common/params.mjs`.
- [x] Actions: convert-pdf, convert-screenshot, generate-einvoice, test-connection.
- [x] Action-wiring tests (`test/actions.test.mjs`) + live sandbox smoke (`test/integration.test.mjs`).
- [x] Per-angle examples (README section + `examples/` for screenshot / invoice-pdf / e-invoice).
- [x] eslint conformance (0 errors) + em-dash sweep (clean).
- [x] README + this roadmap.

## Verified

- `npm test`: 22 offline tests pass (15 body-builder + 7 action-wiring).
- `npm run test:integration` (sandbox key): 3 live smoke tests pass against
  `api.polydoc.tech` (real PDF `%PDF-`, PNG magic bytes, EN 16931 e-invoice 200,
  no 422, gateway auto-applies PDF/A-3b).
- `npm run lint`: 0 errors, 23 advisory `default-value` warnings (conditional props
  with no sensible default).

## Out of scope this pass (follow-ups, need external coordination)

- Register the `polydoc` custom app on Pipedream's platform (api_key / sandbox /
  base_url auth + connect-time test request). Until then `this.$auth.*` only
  resolves once Pipedream provisions the app; local tests exercise the builder and
  action glue directly.
- Push the repo to `polydoc-tech` and open the `PipedreamHQ/pipedream` registry PR.
- Publish three shareable Pipedream workflow templates in the UI (scheduled URL
  screenshot, invoice PDF from template, e-invoice via webhook), mirroring the n8n
  template trio. These are account-bound UI artifacts, not committed files.
- Add a native-component section to the docs guide
  (`polydoc-web/documentation/docs/guides/integrations/pipedream.md`, currently
  HTTP-only) and record Pipedream gotchas in `CONNECTOR-PLAYBOOK.md`.

## Notes / known unknowns

- Pipedream distributes components via the monorepo PR, not an npm publish we
  control, so playbook section 5 (npm Trusted Publishing) does not apply here.
- Binary output: Pipedream steps return JSON, so downloads write to `/tmp` and the
  step returns a path + metadata; screenshot base64 and cloud/webhook JSON are
  first-class alternatives.
