import { z } from "zod";
import { Lightbulb } from "lucide-react";
import { NodeViewContent } from "../extensions/block-node";
import { defineBlock, type BlockRenderProps } from "../define-block";
import { cn } from "@/lib/utils";

const schema = z.object({
  variant: z.enum(["info", "warning", "success"]).default("info"),
});
type CalloutAttrs = z.infer<typeof schema>;

const VARIANT_CLASS: Record<CalloutAttrs["variant"], string> = {
  info: "border-blue-300 bg-blue-50 dark:bg-blue-950/30",
  warning: "border-amber-300 bg-amber-50 dark:bg-amber-950/30",
  success: "border-green-300 bg-green-50 dark:bg-green-950/30",
};

function CalloutRender({ attrs }: BlockRenderProps<CalloutAttrs>) {
  return (
    <div
      data-variant={attrs.variant}
      className={cn(
        "flex gap-2 rounded-md border p-3",
        VARIANT_CLASS[attrs.variant],
      )}
    >
      <Lightbulb className="mt-0.5 size-4 shrink-0" />
      <NodeViewContent className="flex-1" />
    </div>
  );
}

export const calloutBlock = defineBlock<CalloutAttrs>({
  name: "callout",
  label: "Callout",
  group: "content",
  icon: Lightbulb,
  keywords: ["note", "info", "warning", "tip"],
  description: "Highlighted note",
  schema,
  content: "block+",
  config: "auto",
  render: CalloutRender,
});
