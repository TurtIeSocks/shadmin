import type { JSONContent } from "@tiptap/react";

/** Default empty document — a single empty paragraph. */
export const EMPTY_DOC: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

/** Debounce for editor → form onChange (ms). */
export const ONCHANGE_DEBOUNCE_MS = 300;
