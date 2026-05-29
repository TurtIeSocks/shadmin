import { useCallback, useEffect, useMemo, useRef } from "react";
import { useEditor, type Editor, type JSONContent } from "@tiptap/react";
import { createBaseExtensions } from "./extensions/base";
import { createBlockNode } from "./extensions/block-node";
import {
  UnknownBlock,
  wrapUnknownNodes,
  unwrapUnknownNodes,
} from "./extensions/unknown-block";
import { createBlockRegistry } from "./block-registry";
import type { BlockDefinition } from "./define-block";
import { EMPTY_DOC } from "./constants";

export interface UseBlockEditorProps {
  value?: JSONContent;
  blocks: BlockDefinition[];
  editable?: boolean;
  placeholder?: string;
  onChange?: (value: JSONContent) => void;
  onBlur?: () => void;
}

export function useBlockEditor({
  value,
  blocks,
  editable = true,
  placeholder,
  onChange,
  onBlur,
}: UseBlockEditorProps): Editor | null {
  const registry = useMemo(() => createBlockRegistry(blocks), [blocks]);

  const extensions = useMemo(
    () => [
      ...createBaseExtensions({ placeholder }),
      UnknownBlock,
      ...registry.list().map(createBlockNode),
    ],
    [registry, placeholder],
  );

  const handleUpdate = useCallback(
    (editor: Editor) => onChange?.(unwrapUnknownNodes(editor.getJSON())),
    [onChange],
  );

  const editor = useEditor(
    {
      immediatelyRender: false,
      editable,
      extensions,
      content: value ?? EMPTY_DOC,
      onCreate: ({ editor }) => {
        const known = new Set(Object.keys(editor.schema.nodes));
        editor.commands.setContent(wrapUnknownNodes(value ?? EMPTY_DOC, known), {
          emitUpdate: false,
        });
      },
      onUpdate: ({ editor }) => handleUpdate(editor),
      onBlur: () => onBlur?.(),
    },
    [extensions, editable],
  );

  // Re-sync when the external value changes (form reset, record load) without
  // clobbering in-flight edits. The content-equality guard means typing — which
  // pushes the same value back through onChange — is a no-op here. Mirrors the
  // rich-text-input pattern (use-minimal-tiptap.ts).
  const lastValueRef = useRef(value);
  useEffect(() => {
    if (!editor || value === lastValueRef.current) return;
    lastValueRef.current = value;
    const incoming = JSON.stringify(value ?? EMPTY_DOC);
    const current = JSON.stringify(unwrapUnknownNodes(editor.getJSON()));
    if (incoming === current) return;
    const known = new Set(Object.keys(editor.schema.nodes));
    const { from, to } = editor.state.selection;
    editor.commands.setContent(wrapUnknownNodes(value ?? EMPTY_DOC, known), {
      emitUpdate: false,
    });
    const max = Math.max(editor.state.doc.content.size, 1);
    editor.commands.setTextSelection({
      from: Math.max(1, Math.min(from, max)),
      to: Math.max(1, Math.min(to, max)),
    });
  }, [editor, value]);

  return editor;
}
