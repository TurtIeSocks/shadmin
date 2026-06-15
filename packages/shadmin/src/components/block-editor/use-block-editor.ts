import { useCallback, useEffect, useMemo, useRef } from "react";
import { useEditor, type Editor, type JSONContent } from "@tiptap/react";
import type { Range } from "@tiptap/core";
import { createBaseExtensions } from "./extensions/base";
import { createBlockNode } from "./extensions/block-node";
import { SlashCommand } from "./extensions/slash-command";
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
  /** Fired when the user types "/" — opens the catalog picker at `range`. */
  onSlashTrigger?: (range: Range) => void;
  /** Fired when the slash suggestion is dismissed without choosing a block. */
  onSlashClose?: () => void;
  /** Fired once the editor instance exists — for imperative access. */
  onCreate?: (editor: Editor) => void;
}

export function useBlockEditor({
  value,
  blocks,
  editable = true,
  placeholder,
  onChange,
  onBlur,
  onSlashTrigger,
  onSlashClose,
  onCreate,
}: UseBlockEditorProps): Editor | null {
  const registry = useMemo(() => createBlockRegistry(blocks), [blocks]);

  // Thread the slash callbacks per editor through refs so the `extensions`
  // useMemo (and thus the editor instance) stays stable when the parent passes
  // new callback identities. The SlashCommand extension reads `*.current` at
  // call time. Avoids a module-level event singleton that would cross-talk
  // between multiple editors on one page.
  const slashTriggerRef = useRef(onSlashTrigger);
  const slashCloseRef = useRef(onSlashClose);
  const onCreateRef = useRef(onCreate);
  useEffect(() => {
    slashTriggerRef.current = onSlashTrigger;
    slashCloseRef.current = onSlashClose;
    onCreateRef.current = onCreate;
  }, [onSlashTrigger, onSlashClose, onCreate]);

  const extensions = useMemo(
    () => [
      ...createBaseExtensions({ placeholder }),
      UnknownBlock,
      ...registry.list().map(createBlockNode),
      SlashCommand.configure({
        onTrigger: ({ range }) => slashTriggerRef.current?.(range),
        onClose: () => slashCloseRef.current?.(),
      }),
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
        editor.commands.setContent(
          wrapUnknownNodes(value ?? EMPTY_DOC, known),
          {
            emitUpdate: false,
          },
        );
        onCreateRef.current?.(editor);
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
