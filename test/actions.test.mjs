import {
  describe, expect, it,
} from "vitest";
import convertPdf from "../components/polydoc/actions/convert-pdf/convert-pdf.mjs";
import convertScreenshot from "../components/polydoc/actions/convert-screenshot/convert-screenshot.mjs";
import generateEinvoice from "../components/polydoc/actions/generate-einvoice/generate-einvoice.mjs";
import testConnection from "../components/polydoc/actions/test-connection/test-connection.mjs";

const $ = {
  export: () => {},
};

/**
 * Build an action `this` context with a stubbed _request (the HTTP boundary).
 * Captures the args _request was called with so we can assert prop -> body
 * mapping without touching the network or a Pipedream runtime.
 */
function makeCtx(props, response) {
  const calls = [];
  return {
    calls,
    ctx: {
      ...props,
      polydoc: {
        async _request(args) {
          calls.push(args);
          return response;
        },
        async testConnection() {
          calls.push({
            test: true,
          });
          return response;
        },
      },
    },
  };
}

const PDF_RESPONSE = {
  headers: {
    "content-type": "application/pdf",
    "x-conversion-id": "conv-123",
    "x-credit-used": "1",
  },
  data: Buffer.from("%PDF-1.4 fake pdf bytes"),
};

const JSON_RESPONSE = {
  headers: {
    "content-type": "application/json",
    "x-conversion-id": "conv-456",
  },
  data: {
    success: true,
    data: {
      url: "https://bucket.example/out.pdf",
    },
  },
};

describe("convert-pdf action", () => {
  it("maps a download URL conversion to /pdf/convert and writes a file", async () => {
    const {
      ctx, calls,
    } = makeCtx({
      sourceType: "url",
      url: "https://example.com",
      deliveryMode: "download",
      format: "A4",
      landscape: true,
      scale: "0.8",
      marginTop: "10mm",
    }, PDF_RESPONSE);

    const result = await convertPdf.run.call(ctx, {
      $,
    });

    expect(calls[0].endpoint).toBe("/pdf/convert");
    expect(calls[0].isBinary).toBe(true);
    expect(calls[0].body.source).toBe("https://example.com");
    expect(calls[0].body.layout).toEqual({
      format: "A4",
      landscape: true,
      scale: 0.8,
      margin: {
        top: "10mm",
        right: "0",
        bottom: "0",
        left: "0",
      },
    });
    expect(result.filename).toBe("document.pdf");
    expect(result.path).toBe("/tmp/document.pdf");
    expect(result.contentType).toBe("application/pdf");
    expect(result.conversionId).toBe("conv-123");
    expect(result.sizeBytes).toBeGreaterThan(0);
  });

  it("passes cloud storage delivery through as JSON (non-binary)", async () => {
    const {
      ctx, calls,
    } = makeCtx({
      sourceType: "html",
      html: "<h1>Hi</h1>",
      deliveryMode: "cloudStorage",
      presignedUrl: "https://put.example/abc",
    }, JSON_RESPONSE);

    const result = await convertPdf.run.call(ctx, {
      $,
    });

    expect(calls[0].isBinary).toBe(false);
    expect(calls[0].body.cloudStorage).toEqual({
      presignedUrl: "https://put.example/abc",
    });
    expect(result.data).toEqual(JSON_RESPONSE.data);
  });

  it("throws a clear error when the required URL is missing", async () => {
    const { ctx } = makeCtx({
      sourceType: "url",
      deliveryMode: "download",
    }, PDF_RESPONSE);

    await expect(convertPdf.run.call(ctx, {
      $,
    })).rejects.toThrow(/URL is required/);
  });
});

describe("convert-screenshot action", () => {
  it("captures a binary screenshot and writes the right extension", async () => {
    const {
      ctx, calls,
    } = makeCtx({
      sourceType: "url",
      url: "https://example.com",
      deliveryMode: "download",
      imageType: "png",
      fullPage: true,
      viewportWidth: 1024,
      viewportHeight: 768,
    }, {
      headers: {
        "content-type": "image/png",
      },
      data: Buffer.from("fake png bytes"),
    });

    const result = await convertScreenshot.run.call(ctx, {
      $,
    });

    expect(calls[0].endpoint).toBe("/screenshot/convert");
    expect(calls[0].isBinary).toBe(true);
    expect(calls[0].body.screenshot).toEqual({
      type: "png",
      fullPage: true,
      viewport: {
        width: 1024,
        height: 768,
      },
    });
    expect(result.filename).toBe("screenshot.png");
    expect(result.path).toBe("/tmp/screenshot.png");
  });

  it("base64 encoding sets screenshot.encoding and returns JSON (non-binary)", async () => {
    const {
      ctx, calls,
    } = makeCtx({
      sourceType: "url",
      url: "https://example.com",
      deliveryMode: "download",
      imageType: "png",
      outputEncoding: "base64",
    }, {
      headers: {
        "content-type": "application/json",
      },
      data: {
        success: true,
        data: {
          base64: "aGVsbG8=",
        },
      },
    });

    const result = await convertScreenshot.run.call(ctx, {
      $,
    });

    expect(calls[0].isBinary).toBe(false);
    expect(calls[0].body.screenshot.encoding).toBe("base64");
    expect(result.data.data.base64).toBe("aGVsbG8=");
  });
});

describe("generate-einvoice action", () => {
  it("nests the eInvoice payload and targets /pdf/convert", async () => {
    const {
      ctx, calls,
    } = makeCtx({
      sourceType: "html",
      html: "<h1>Invoice</h1>",
      deliveryMode: "download",
      eInvoiceStandard: "zugferd",
      eInvoiceProfile: "en16931",
      eInvoiceVerify: true,
      invoice: {
        number: "INV-1",
      },
    }, PDF_RESPONSE);

    const result = await generateEinvoice.run.call(ctx, {
      $,
    });

    expect(calls[0].endpoint).toBe("/pdf/convert");
    expect(calls[0].body.eInvoice).toEqual({
      standard: "zugferd",
      profile: "en16931",
      invoice: {
        number: "INV-1",
      },
      verify: true,
    });
    expect(result.path).toBe("/tmp/document.pdf");
  });
});

describe("test-connection action", () => {
  it("calls testConnection and reports success", async () => {
    const {
      ctx, calls,
    } = makeCtx({}, PDF_RESPONSE);

    const result = await testConnection.run.call(ctx, {
      $,
    });

    expect(calls[0]).toEqual({
      test: true,
    });
    expect(result).toEqual({
      success: true,
    });
  });
});

describe("sandbox toggle", () => {
  it("convert-pdf forwards sandbox: true to _request", async () => {
    const {
      ctx, calls,
    } = makeCtx({
      sourceType: "url",
      url: "https://example.com",
      deliveryMode: "download",
      sandbox: true,
    }, PDF_RESPONSE);

    await convertPdf.run.call(ctx, {
      $,
    });

    expect(calls[0].sandbox).toBe(true);
  });

  it("convert-pdf leaves sandbox off when the prop is unset", async () => {
    const {
      ctx, calls,
    } = makeCtx({
      sourceType: "url",
      url: "https://example.com",
      deliveryMode: "download",
    }, PDF_RESPONSE);

    await convertPdf.run.call(ctx, {
      $,
    });

    expect(calls[0].sandbox).toBeFalsy();
  });

  it("convert-screenshot forwards the sandbox flag", async () => {
    const {
      ctx, calls,
    } = makeCtx({
      sourceType: "url",
      url: "https://example.com",
      deliveryMode: "download",
      imageType: "png",
      sandbox: true,
    }, {
      headers: {
        "content-type": "image/png",
      },
      data: Buffer.from("fake png bytes"),
    });

    await convertScreenshot.run.call(ctx, {
      $,
    });

    expect(calls[0].sandbox).toBe(true);
  });

  it("generate-einvoice forwards the sandbox flag", async () => {
    const {
      ctx, calls,
    } = makeCtx({
      sourceType: "html",
      html: "<h1>Invoice</h1>",
      deliveryMode: "download",
      eInvoiceStandard: "zugferd",
      eInvoiceProfile: "en16931",
      invoice: {
        number: "INV-1",
      },
      sandbox: true,
    }, PDF_RESPONSE);

    await generateEinvoice.run.call(ctx, {
      $,
    });

    expect(calls[0].sandbox).toBe(true);
  });
});
