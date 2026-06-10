import { describe, expect, it } from "vitest";
import {
  detectValueShape,
  toEditorText,
  fromEditorText,
} from "./detect-value-shape";

describe("detectValueShape", () => {
  it("returns null for undefined", () => {
    expect(detectValueShape(undefined)).toBeNull();
  });

  it("returns 'string' for string values (including empty)", () => {
    expect(detectValueShape("")).toBe("string");
    expect(detectValueShape("hello")).toBe("string");
    expect(detectValueShape('{"foo":1}')).toBe("string");
  });

  it("returns 'object' for null, arrays, and objects", () => {
    expect(detectValueShape(null)).toBe("object");
    expect(detectValueShape([])).toBe("object");
    expect(detectValueShape({})).toBe("object");
    expect(detectValueShape({ a: 1 })).toBe("object");
  });

  it("treats numbers and booleans as 'object' (rare, but valid JSON)", () => {
    expect(detectValueShape(42)).toBe("object");
    expect(detectValueShape(true)).toBe("object");
  });
});

describe("toEditorText", () => {
  it("returns the raw string in string mode", () => {
    expect(toEditorText("raw", "string")).toBe("raw");
  });

  it("returns empty string when value is not a string in string mode", () => {
    expect(toEditorText(undefined, "string")).toBe("");
    expect(toEditorText({ a: 1 }, "string")).toBe("");
  });

  it("returns pretty JSON in object mode with default indent 2", () => {
    expect(toEditorText({ a: 1 }, "object")).toBe('{\n  "a": 1\n}');
  });

  it("honors custom indent in object mode", () => {
    expect(toEditorText({ a: 1 }, "object", 4)).toBe('{\n    "a": 1\n}');
  });

  it("returns empty string for undefined in object mode", () => {
    expect(toEditorText(undefined, "object")).toBe("");
  });

  it("returns empty string when JSON.stringify throws (circular)", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(toEditorText(circular, "object")).toBe("");
  });
});

describe("fromEditorText", () => {
  it("passes text through in string mode", () => {
    expect(fromEditorText("anything", "string")).toEqual({
      value: "anything",
      parseError: null,
    });
  });

  it("returns null and no error for empty text in object mode", () => {
    expect(fromEditorText("", "object")).toEqual({
      value: null,
      parseError: null,
    });
    expect(fromEditorText("   ", "object")).toEqual({
      value: null,
      parseError: null,
    });
  });

  it("parses valid JSON in object mode", () => {
    expect(fromEditorText('{"a":1}', "object")).toEqual({
      value: { a: 1 },
      parseError: null,
    });
  });

  it("returns parseError for invalid JSON in object mode", () => {
    const result = fromEditorText("{not json", "object");
    expect(result.value).toBeUndefined();
    expect(result.parseError).toBeInstanceOf(Error);
  });
});
