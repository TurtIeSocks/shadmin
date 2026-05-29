import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  EditorContent,
  EditorContext,
  type Editor,
  type JSONContent,
} from "@tiptap/react";
import type { Range } from "@tiptap/core";
import { debounce } from "lodash";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useBlockEditor } from "./use-block-editor";
import { createBlockRegistry } from "./block-registry";
import { insertBlock } from "./extensions/slash-command";
import { CatalogPicker } from "./chrome/catalog-picker";
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
  /** Fired once the editor instance exists — for imperative access. */
  onCreate?: (editor: Editor) => void;
}

export function BlockEditor({
  value,
  blocks,
  editable = true,
  placeholder,
  className,
  onChange,
  onBlur,
  onCreate,
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

  // Catalog picker state. `range` is the slash query range to replace on insert;
  // it is undefined when opened programmatically (⊕ gutter, Task 11) — inserting
  // then appends at the caret instead of deleting a range.
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerRange, setPickerRange] = useState<Range | undefined>();

  const handleSlashTrigger = useCallback((range: Range) => {
    setPickerRange(range);
    setPickerOpen(true);
  }, []);

  const handleSlashClose = useCallback(() => {
    // Only close on dismissal if the picker is not being interacted with.
    // The picker's own onSelect/onClose drive the close otherwise.
    setPickerOpen(false);
  }, []);

  const editor = useBlockEditor({
    value,
    blocks,
    editable,
    placeholder,
    onChange: debouncedChange,
    onBlur,
    onSlashTrigger: handleSlashTrigger,
    onSlashClose: handleSlashClose,
    onCreate,
  });

  // Register the programmatic open channel on the SlashCommand extension's
  // storage (used by the ⊕ gutter button in Task 11, and by tests). Funnels
  // every "open picker" entry point — slash trigger and button alike — through
  // one per-editor channel. Opening without a range appends at the caret.
  useEffect(() => {
    if (!editor) return;
    const storage = editor.storage.slashCommand;
    storage.open = (range) => {
      setPickerRange(range);
      setPickerOpen(true);
    };
    return () => {
      storage.open = null;
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <TooltipProvider>
      <EditorContext.Provider value={{ editor }}>
        <BlockEditorChrome
          editor={editor}
          editable={editable}
          blocks={blocks}
          className={className}
          pickerOpen={pickerOpen}
          onPickerOpenChange={setPickerOpen}
          pickerRange={pickerRange}
        />
      </EditorContext.Provider>
    </TooltipProvider>
  );
}

/** Chrome wrapper — extended with gutter / toolbar in later tasks. */
function BlockEditorChrome({
  editor,
  editable,
  blocks,
  className,
  pickerOpen,
  onPickerOpenChange,
  pickerRange,
}: {
  editor: Editor;
  editable: boolean;
  blocks: BlockDefinition[];
  className?: string;
  pickerOpen: boolean;
  onPickerOpenChange: (open: boolean) => void;
  pickerRange: Range | undefined;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const registry = useMemo(() => createBlockRegistry(blocks), [blocks]);

  const handleSelect = useCallback(
    (name: string) => {
      insertBlock(editor, name, pickerRange);
      onPickerOpenChange(false);
    },
    [editor, pickerRange, onPickerOpenChange],
  );

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
      <Popover open={pickerOpen} onOpenChange={onPickerOpenChange}>
        <PopoverAnchor asChild>
          <EditorContent
            editor={editor}
            className="block-editor-content px-3 py-2"
          />
        </PopoverAnchor>
        <PopoverContent
          align="start"
          className="w-auto p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <CatalogPicker
            registry={registry}
            onSelect={handleSelect}
            onClose={() => onPickerOpenChange(false)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
