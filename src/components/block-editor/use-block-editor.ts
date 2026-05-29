import { useCallback, useMemo } from "react";
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

  return editor;
}
