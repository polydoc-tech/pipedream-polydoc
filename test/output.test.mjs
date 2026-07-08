import {
  describe, expect, it,
} from "vitest";
import { extractApiErrorMessage } from "../components/polydoc/common/output.mjs";

/** Build a thrown-error shape matching what axios surfaces for an HTTP error. */
function apiError(data) {
  return {
    response: {
      data,
    },
  };
}

describe("extractApiErrorMessage", () => {
  it("returns the plain message when there are no details", () => {
    expect(extractApiErrorMessage(apiError({
      message: "Nope",
      error: "Bad Request",
    }))).toBe("Nope");
  });

  it("appends the field-level details (path: message) to the base message", () => {
    expect(extractApiErrorMessage(apiError({
      message: "Request validation failed. Please check the request body against the API documentation.",
      error: "Bad Request",
      details: [
        {
          path: "eInvoice.invoice",
          message: "must be object",
        },
      ],
    }))).toBe("Request validation failed. Please check the request body against the API documentation. (eInvoice.invoice: must be object)");
  });

  it("joins multiple details with a semicolon", () => {
    expect(extractApiErrorMessage(apiError({
      message: "Request validation failed.",
      details: [
        {
          path: "a",
          message: "bad",
        },
        {
          path: "b",
          message: "worse",
        },
      ],
    }))).toBe("Request validation failed. (a: bad; b: worse)");
  });

  it("decodes an ArrayBuffer JSON error body", () => {
    const buf = new TextEncoder().encode(JSON.stringify({
      message: "boom",
    })).buffer;
    expect(extractApiErrorMessage(apiError(buf))).toBe("boom");
  });
});
