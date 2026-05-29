import { useEffect, useMemo, useRef } from "react";
import {
  EditorContent,
  EditorContext,
  type Editor,
  type JSONContent,
} from "@tiptap/react";
import { debounce } from "lodash";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useBlockEditor } from "./use-block-editor";
import type { BlockDefinition } from "./define-block";
import { ONCHANGE_DEBOUNCE_MS } from "./constants";

export interface BlockEditorProps {
  value?: JSONContent;
  blocks: BlockDefinition[];
  editable?: boolean;
  placeholder?: string;
  className?: string;
  onChange?: (value: JSONContent) => void;
  onBlur?: () => void;
}

export function BlockEditor({
  value,
  blocks,
  editable = true,
  placeholder,
  className,
  onChange,
  onBlur,
}: BlockEditorProps) {
  // Stable debounced callback: read the latest onChange through a ref so the
  // instance is created once. Prevents (a) dropped pending saves when the parent
  // passes a new onChange identity and (b) a stale onUpdate closure in the editor.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const debouncedChange = useMemo(
    () =>
      debounce(
        (next: JSONContent) => onChangeRef.current?.(next),
        ONCHANGE_DEBOUNCE_MS,
      ),
    [],
  );

  useEffect(() => () => debouncedChange.cancel(), [debouncedChange]);

  const editor = useBlockEditor({
    value,
    blocks,
    editable,
    placeholder,
    onChange: debouncedChange,
    onBlur,
  });

  if (!editor) return null;

  return (
    <TooltipProvider>
      <EditorContext.Provider value={{ editor }}>
        <BlockEditorChrome
          editor={editor}
          editable={editable}
          className={className}
        />
      </EditorContext.Provider>
    </TooltipProvider>
  );
}

/** Chrome wrapper — extended with gutter / picker / toolbar in later tasks. */
function BlockEditorChrome({
  editor,
  editable,
  className,
}: {
  editor: Editor;
  editable: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      data-block-editor
      className={cn(
        editable &&
          "rounded-md border border-input shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        className,
      )}
    >
      <EditorContent
        editor={editor}
        className="block-editor-content px-3 py-2"
      />
    </div>
  );
}
