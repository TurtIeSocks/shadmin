import { Node } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import type { JSONContent } from "@tiptap/react";
import { AlertTriangle } from "lucide-react";

export const UNKNOWN_BLOCK_NAME = "unknownBlock";

/** Node types that are always part of the doc and never "foreign". */
const STRUCTURAL = new Set(["doc", "text"]);

/** Wrap any node whose `type` is not in `known` into an unknownBlock carrying its JSON. */
export function wrapUnknownNodes(node: JSONContent, known: Set<string>): JSONContent {
  if (!node || typeof node !== "object") return node;
  const type = node.type;
  if (type && !STRUCTURAL.has(type) && !known.has(type)) {
    return { type: UNKNOWN_BLOCK_NAME, attrs: { payload: node } };
  }
  if (Array.isArray(node.content)) {
    return { ...node, content: node.content.map((child) => wrapUnknownNodes(child, known)) };
  }
  return node;
}

/** Inverse of wrapUnknownNodes: restore the original JSON from each unknownBlock. */
export function unwrapUnknownNodes(node: JSONContent): JSONContent {
  if (!node || typeof node !== "object") return node;
  if (node.type === UNKNOWN_BLOCK_NAME && node.attrs?.payload) {
    return node.attrs.payload as JSONContent;
  }
  if (Array.isArray(node.content)) {
    return { ...node, content: node.content.map(unwrapUnknownNodes) };
  }
  return node;
}

function UnknownBlockView({ node }: NodeViewProps) {
  const payload = node.attrs.payload as JSONContent | undefined;
  return (
    <NodeViewWrapper
      data-block={UNKNOWN_BLOCK_NAME}
      className="my-2 flex items-center gap-2 rounded-md border border-dashed border-muted-foreground/40 bg-muted/40 p-3 text-sm text-muted-foreground"
    >
      <AlertTriangle className="size-4 shrink-0" />
      <span>Unknown block: <code>{payload?.type ?? "?"}</code> (preserved on save)</span>
    </NodeViewWrapper>
  );
}

/** Atom node that stores a foreign node's JSON in `payload` and renders a placeholder. */
export const UnknownBlock = Node.create({
  name: UNKNOWN_BLOCK_NAME,
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return { payload: { default: null } };
  },
  parseHTML() {
    return [{ tag: `div[data-block="${UNKNOWN_BLOCK_NAME}"]` }];
  },
  renderHTML() {
    return ["div", { "data-block": UNKNOWN_BLOCK_NAME }];
  },
  addNodeView() {
    return ReactNodeViewRenderer(UnknownBlockView);
  },
});
