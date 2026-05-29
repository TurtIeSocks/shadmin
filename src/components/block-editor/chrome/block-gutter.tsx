import { DragHandle } from "@tiptap/extension-drag-handle-react";
import { type Editor } from "@tiptap/react";
import { GripVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BlockGutterProps {
  editor: Editor;
  /** Open the catalog picker (⊕). Opened without a range → insert at the caret. */
  onAdd: () => void;
}

/**
 * Left-margin gutter that follows the hovered block via the drag-handle
 * extension's portal: a ⊕ "Add block" button (opens the catalog picker) and a
 * ⠿ drag handle (ProseMirror-native reorder — `DragHandle` makes the whole
 * portal draggable and moves the underlying node on drop).
 *
 * Mount this only when the editor is editable; the drag-handle plugin attaches
 * drag listeners that assume an editable surface.
 */
export function BlockGutter({ editor, onAdd }: BlockGutterProps) {
  return (
    <DragHandle
      editor={editor}
      className="flex items-center gap-0.5 pr-1 text-muted-foreground"
    >
      <Button
        type="button"
        size="icon-xs"
        variant="ghost"
        aria-label="Add block"
        onClick={onAdd}
      >
        <Plus />
      </Button>
      <span
        className="flex cursor-grab items-center active:cursor-grabbing"
        aria-label="Drag to reorder"
        role="img"
      >
        <GripVertical className="size-4" />
      </span>
    </DragHandle>
  );
}
