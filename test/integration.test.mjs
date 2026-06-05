import {
  describe, expect, it,
} from "vitest";
import { buildRequestBody } from "../components/polydoc/common/build-request-body.mjs";
import { DEFAULT_BASE_URL } from "../components/polydoc/common/constants.mjs";

/**
 * Live sandbox smoke tests. Skipped unless POLYDOC_API_KEY is set. Every request
 * forces X-Sandbox: true so it never touches production quota, and bodies are
 * assembled with the same buildRequestBody the actions use, so this exercises
 * the real request shape against the live contract.
 */

const apiKey = process.env.POLYDOC_API_KEY;
const baseUrl = (process.env.POLYDOC_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function call(endpoint, body, {
  binary = false,
} = {}) {
  const res = await fetch(`${baseUrl}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "X-Sandbox": "true",
    },
    body: JSON.stringify(body),
  });
  // Sandbox is rate-limited (~5/sec); space requests out.
  await sleep(300);
  return {
    status: res.status,
    contentType: res.headers.get("content-type"),
    buffer: binary ? Buffer.from(await res.arrayBuffer()) : undefined,
    text: binary ? undefined : await res.text(),
  };
}

describe.skipIf(!apiKey)("PolyDoc live sandbox", () => {
  it("PDF from inline HTML returns a real PDF", async () => {
    const {
      endpoint, body,
    } = buildRequestBody({
      operation: "pdf",
      sourceType: "html",
      html: "<h1>Hello PolyDoc</h1><p>Pipedream smoke test.</p>",
      filename: "smoke.pdf",
      delivery: {
        mode: "download",
      },
    });
    const res = await call(endpoint, body, {
      binary: true,
    });
    expect(res.status).toBe(200);
    expect(res.contentType).toContain("application/pdf");
    expect(res.buffer.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  });

  it("Screenshot of a URL returns a PNG", async () => {
    const {
      endpoint, body,
    } = buildRequestBody({
      operation: "screenshot",
      sourceType: "url",
      url: "https://example.com",
      screenshotOptions: {
        imageType: "png",
        fullPage: true,
      },
      delivery: {
        mode: "download",
      },
    });
    const res = await call(endpoint, body, {
      binary: true,
    });
    expect(res.status).toBe(200);
    expect(res.contentType).toContain("image/png");
    // PNG magic number.
    expect([
      ...res.buffer.subarray(0, 4),
    ]).toEqual([
      0x89,
      0x50,
      0x4e,
      0x47,
    ]);
  });

  it("E-Invoice (ZUGFeRD EN 16931) returns a hybrid PDF", async () => {
    const {
      endpoint, body,
    } = buildRequestBody({
      operation: "einvoice",
      sourceType: "html",
      html: "<h1>Invoice INV-PD-001</h1>",
      eInvoiceStandard: "zugferd",
      eInvoiceProfile: "en16931",
      eInvoiceVerify: true,
      invoice: {
        number: "INV-PD-001",
        issueDate: "2026-01-15",
        dueDate: "2026-02-15",
        currencyCode: "EUR",
        seller: {
          name: "Northwind Studio",
          address: {
            line1: "1 Studio Way",
            city: "Berlin",
            postalCode: "10115",
            countryCode: "DE",
          },
          taxId: "DE123456789",
          email: "billing@northwind.example",
        },
        buyer: {
          name: "Contoso GmbH",
          address: {
            line1: "5 Market St",
            city: "Munich",
            postalCode: "80331",
            countryCode: "DE",
          },
        },
        lines: [
          {
            description: "Design services",
            quantity: 10,
            unitCode: "HUR",
            unitPrice: 100,
            lineTotal: 1000,
            vatRate: 19,
            vatCategoryCode: "S",
          },
        ],
        taxSummary: [
          {
            categoryCode: "S",
            rate: 19,
            taxableAmount: 1000,
            taxAmount: 190,
          },
        ],
        paymentTerms: "Net 30 days",
        totalNetAmount: 1000,
        totalTaxAmount: 190,
        totalGrossAmount: 1190,
      },
      delivery: {
        mode: "download",
      },
    });
    const res = await call(endpoint, body, {
      binary: true,
    });
    expect(res.status).toBe(200);
    expect(res.contentType).toContain("application/pdf");
    expect(res.buffer.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  });
});
