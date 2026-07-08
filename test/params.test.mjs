import {
  describe, expect, it,
} from "vitest";
import {
  coerceObject, commonParams,
} from "../components/polydoc/common/params.mjs";

describe("coerceObject", () => {
  it("passes a real object through untouched", () => {
    const obj = {
      a: 1,
    };
    expect(coerceObject(obj, "X")).toBe(obj);
  });

  it("passes undefined through as undefined", () => {
    expect(coerceObject(undefined, "X")).toBeUndefined();
  });

  it("parses a JSON-string object into an object (the Pipedream UI path)", () => {
    expect(coerceObject('{"number":"INV-1","totalNetAmount":100}', "Invoice")).toEqual({
      number: "INV-1",
      totalNetAmount: 100,
    });
  });

  it("treats an empty or whitespace string as unset", () => {
    expect(coerceObject("", "X")).toBeUndefined();
    expect(coerceObject("   ", "X")).toBeUndefined();
  });

  it("throws a labelled error on malformed JSON", () => {
    expect(() => coerceObject("{not json}", "Invoice")).toThrow("Invoice must be valid JSON.");
  });
});

describe("commonParams object-prop coercion", () => {
  it("parses templateData and advanced when passed as JSON strings", () => {
    const params = commonParams({
      sourceType: "template",
      templateId: "abc",
      templateData: '{"customerName":"Ada"}',
      advanced: '{"pdf":{"pdfa":true}}',
      deliveryMode: "download",
    });
    expect(params.templateData).toEqual({
      customerName: "Ada",
    });
    expect(params.advanced).toEqual({
      pdf: {
        pdfa: true,
      },
    });
  });

  it("spreads webhookOptions into the delivery webhook when passed as a JSON string", () => {
    const params = commonParams({
      sourceType: "url",
      url: "https://example.com",
      deliveryMode: "webhook",
      webhookUrl: "https://hook.example.com",
      webhookOptions: '{"method":"PUT","retries":3}',
    });
    expect(params.delivery.webhook).toEqual({
      url: "https://hook.example.com",
      method: "PUT",
      retries: 3,
    });
  });
});
