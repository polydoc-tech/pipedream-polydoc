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

## Distribution (done)

- [x] Source repo pushed to `polydoc-tech/pipedream-polydoc` (default branch `main`).
- [x] Registry PR opened: **PipedreamHQ/pipedream#21180** (`add-polydoc-app` branch
  on the `polydoc-tech` fork). Added via the Git Data API rather than a clone, since
  the monorepo is ~685 MB. Commit authored as `PolyDoc <hello@polydoc.tech>`.
- [x] Auth simplified: `base_url` dropped (host is fixed to `https://api.polydoc.tech`).
  The Pipedream app needs only `api_key` (secret) + `sandbox` (boolean).

### Review feedback addressed (CodeRabbit automated review, 7 findings + 2 checks)

- [x] `syncDir` prop (`type: "dir"`, `accessMode: "write"`, `sync: true`) added to the
  three file-writing actions; `output.mjs` writes to `process.env.STASH_DIR || "/tmp"`
  so Pipedream syncs the returned file path.
- [x] `readOnlyHint` set to `false` on the test-connection action (it invokes a
  conversion endpoint, so it is not a pure read).
- [x] Inline JSON examples added to the `templateData`, `webhookOptions`, and `invoice`
  object prop descriptions.
- [x] Docstrings added across the app methods and the builder/params helpers to clear
  the 80% docstring-coverage check.
- [x] Kept the `_request` `try/catch` + `extractApiErrorMessage` (decodes the
  arraybuffer error body so users see PolyDoc's message, not raw bytes), now documented
  with a why-comment. This is the one CodeRabbit point we did not "fix" as suggested,
  by design.
- [x] Renamed the registry PR title to "Add PolyDoc app with PDF, screenshot, and
  e-invoice actions". Fork PR branch updated (commit `dbebf44`); source repo main at
  `bdefeda`.
- [x] Second CodeRabbit pass (triggered by `dbebf44`) re-flagged only the four `try/catch`
  threads as "duplicate" (the one point we keep by design); the other three are
  auto-marked addressed. Replied on all seven threads (kept-by-design rationale on the
  four `try/catch`, `dbebf44` confirmation on the three fixed) and filled in the PR
  template checklist, so the pre-merge Description check now has the versioning and
  CodeRabbit boxes ticked. The "app already integrated" box stays unchecked: it can only
  become true once Pipedream provisions the `polydoc` app auth.

## Out of scope this pass (follow-ups, need external coordination)

- Pipedream must provision the `polydoc` app auth (api_key secret + sandbox boolean +
  the connect-time test request) before the components are testable end to end and the
  PR can merge. Flagged in the PR body. A maintainer (`GTFalcao`) is the requested
  reviewer and the bot confirmed the PR is on their backlog ("team has been notified"),
  so the intake already happened through the PR. No separate app-integration-request
  issue and no `#contribute` ping needed: if the auth step blocks the review, raise it
  directly with the reviewer on the PR thread. Otherwise wait for the review.
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
