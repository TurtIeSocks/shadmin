import { type Editor } from "@tiptap/react";
import { NodeSelection } from "@tiptap/pm/state";
import { Copy, Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BlockToolbarProps {
  editor: Editor;
  /** Open the config popover for the selected block. */
  onConfigure: () => void;
}

/**
 * Floating actions for the currently-selected block node: configure (opens the
 * schema-driven config popover), duplicate (inserts a copy right after), and
 * delete (removes the node). Rendered by the chrome inside a popover anchored to
 * the selection — only when a block `NodeSelection` is active.
 */
export function BlockToolbar({ editor, onConfigure }: BlockToolbarProps) {
  const duplicate = () => {
    const { selection } = editor.state;
    if (!(selection instanceof NodeSelection)) return;
    const json = selection.node.toJSON();
    // Insert the copy immediately after the selected node.
    editor.chain().focus().insertContentAt(selection.to, json).run();
  };

  const remove = () => {
    editor.chain().focus().deleteSelection().run();
  };

  return (
    <div className="flex items-center gap-0.5 rounded-md border bg-popover p-0.5 shadow-md">
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label="Configure block"
        onClick={onConfigure}
      >
        <Settings2 />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label="Duplicate block"
        onClick={duplicate}
      >
        <Copy />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label="Delete block"
        onClick={remove}
      >
        <Trash2 />
      </Button>
    </div>
  );
}
