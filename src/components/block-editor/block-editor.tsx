import { useMemo, useRef } from "react";
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
  const debouncedChange = useMemo(
    () => (onChange ? debounce(onChange, ONCHANGE_DEBOUNCE_MS) : undefined),
    [onChange],
  );

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
