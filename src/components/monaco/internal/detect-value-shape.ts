export type ValueShape = "string" | "object";

export function detectValueShape(value: unknown): ValueShape | null {
  if (value === undefined) return null;
  if (typeof value === "string") return "string";
  return "object";
}

export function toEditorText(
  value: unknown,
  shape: ValueShape,
  indent = 2,
): string {
  if (shape === "string") {
    return typeof value === "string" ? value : "";
  }
  if (value === undefined) return "";
  try {
    return JSON.stringify(value, null, indent);
  } catch {
    return "";
  }
}

export function fromEditorText(
  text: string,
  shape: ValueShape,
): { value: unknown; parseError: Error | null } {
  if (shape === "string") {
    return { value: text, parseError: null };
  }
  if (text.trim() === "") {
    return { value: null, parseError: null };
  }
  try {
    return { value: JSON.parse(text), parseError: null };
  } catch (e) {
    return { value: undefined, parseError: e as Error };
  }
}
