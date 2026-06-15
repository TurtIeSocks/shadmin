import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import type { Extensions } from "@tiptap/react";

export interface BaseExtensionsOptions {
  placeholder?: string;
}

/** Baseline rich-text floor: headings, lists, marks, links, code, HR. */
export function createBaseExtensions({
  placeholder = "Type '/' for blocks…",
}: BaseExtensionsOptions = {}): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Placeholder.configure({ placeholder: () => placeholder }),
  ];
}
