import { Node, mergeAttributes } from "@tiptap/core";
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewContent,
  type NodeViewProps,
} from "@tiptap/react";
import { createElement } from "react";
import type { ReactNode } from "react";
import type { BlockDefinition } from "../define-block";
import { getDefaultAttrs, schemaKeys } from "../define-block";

/** Build the React node-view component for a block definition. */
function makeBlockView(def: BlockDefinition) {
  return function BlockView({
    node,
    editor,
    selected,
    updateAttributes,
  }: NodeViewProps) {
    const Component = (!editor.isEditable && def.read) || def.edit || def.render;
    const mode = editor.isEditable ? "edit" : "read";
    const body = createElement(Component as BlockDefinition["render"], {
      attrs: node.attrs as Record<string, unknown>,
      mode,
      selected,
      updateAttrs: (patch: Record<string, unknown>) => updateAttributes(patch),
    });
    return (
      <NodeViewWrapper
        data-block={def.name}
        data-selected={selected || undefined}
        className="relative my-1 rounded-sm data-[selected]:outline data-[selected]:outline-2 data-[selected]:outline-primary/60"
      >
        {def.content ? <BlockWithContent>{body}</BlockWithContent> : body}
      </NodeViewWrapper>
    );
  };
}

/**
 * For content blocks, the block author renders `<NodeViewContent />` themselves
 * inside `render`. This wrapper is a no-op passthrough kept for symmetry.
 */
function BlockWithContent({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export { NodeViewContent };

/** Turn a BlockDefinition into a TipTap Node with a React node-view. */
export function createBlockNode(def: BlockDefinition): Node {
  const defaults = getDefaultAttrs(def.schema);
  const keys = schemaKeys(def.schema);
  const isAtom = def.atom ?? def.content == null;

  return Node.create({
    name: def.name,
    group: "block",
    selectable: true,
    draggable: true,
    atom: isAtom,
    ...(def.content ? { content: def.content } : {}),
    addAttributes() {
      return Object.fromEntries(
        keys.map((key) => [
          key,
          { default: defaults[key as keyof typeof defaults] ?? null },
        ]),
      );
    },
    parseHTML() {
      return [{ tag: `div[data-block="${def.name}"]` }];
    },
    renderHTML({ HTMLAttributes }) {
      const attrs = mergeAttributes(HTMLAttributes, { "data-block": def.name });
      return def.content ? ["div", attrs, 0] : ["div", attrs];
    },
    addNodeView() {
      return ReactNodeViewRenderer(makeBlockView(def));
    },
  });
}
