# Changelog

The versions are those of `@pipedream/polydoc`
(https://www.npmjs.com/package/@pipedream/polydoc), the component Pipedream publishes from its
own registry repo. CI checks the version in `components/polydoc/package.json`. Dates are the
npm publish date, in UTC.

This file starts at 0.1.1; 0.0.1 (2026-06-24) and 0.1.0 (2026-06-27) are on npm. The registry
copy is changed in pull requests to the registry repo, so it can differ from this repo. On
2026-11-27 `main` had a Sandbox switch on each action that 0.1.1 lacks, and 0.1.1 had a longer
Invoice field description that `main` lacks.

## 0.1.1 - 2026-07-08

- Object fields (Invoice, Template Data, Webhook Options, Advanced) set as JSON text in the
  Pipedream UI are parsed into objects. Text that is not valid JSON stops the action with an
  error that names the field.
- An API error message includes the per-field details the API returns.
