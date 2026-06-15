import { z } from "zod";
import { ChevronRight } from "lucide-react";
import { NodeViewContent } from "../extensions/block-node";
import { defineBlock, type BlockRenderProps } from "../define-block";
import { cn } from "@/lib/utils";

const schema = z.object({
  summary: z.string().default("Toggle"),
  open: z.boolean().default(false),
});
type ToggleAttrs = z.infer<typeof schema>;

function ToggleRender({
  attrs,
  updateAttrs,
  mode,
}: BlockRenderProps<ToggleAttrs>) {
  const expanded = mode === "edit" ? true : attrs.open;
  return (
    <div className="rounded-md border p-2">
      <button
        type="button"
        className="flex w-full items-center gap-1 text-left text-sm font-medium"
        onClick={() => mode === "read" && updateAttrs?.({ open: !attrs.open })}
        aria-expanded={expanded}
      >
        <ChevronRight
          className={cn("size-4 transition-transform", expanded && "rotate-90")}
        />
        {attrs.summary}
      </button>
      {/* The content hole must always be in the DOM so ProseMirror can manage it;
          hide it visually when collapsed in read mode. */}
      <NodeViewContent className={cn("mt-2 pl-5", !expanded && "hidden")} />
    </div>
  );
}

export const toggleBlock = defineBlock<ToggleAttrs>({
  name: "toggle",
  label: "Toggle",
  group: "content",
  icon: ChevronRight,
  keywords: ["collapse", "accordion", "details", "disclosure"],
  description: "Collapsible section",
  schema,
  content: "block+",
  config: "auto",
  render: ToggleRender,
});
