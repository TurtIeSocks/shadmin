import { z } from "zod";
import { Boxes } from "lucide-react";
import { useGetOne } from "ra-core";
import {
  defineBlock,
  type BlockRenderProps,
  type BlockConfigProps,
} from "../define-block";
import { BlockEmpty, BlockSkeleton, BlockError } from "./block-states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const schema = z.object({
  resource: z.string().default(""),
  id: z.union([z.string(), z.number()]).nullable().default(null),
  fields: z.array(z.string()).optional(),
  layout: z.enum(["card", "inline"]).default("card"),
});
type RefAttrs = z.infer<typeof schema>;

function ReferenceRecordRender({ attrs }: BlockRenderProps<RefAttrs>) {
  const enabled = Boolean(attrs.resource && attrs.id != null);
  const { data, isPending, error } = useGetOne(
    attrs.resource,
    { id: attrs.id as string | number },
    { enabled },
  );

  if (!enabled) return <BlockEmpty label="Pick a record to reference" />;
  if (isPending) return <BlockSkeleton />;
  if (error || !data) return <BlockError label="Record unavailable" />;

  const fields = attrs.fields?.length
    ? attrs.fields
    : Object.keys(data).filter((k) => k !== "id");
  const title = String(data.name ?? data.title ?? data.id);

  if (attrs.layout === "inline") {
    return (
      <span className="rounded bg-muted px-1.5 py-0.5 text-sm">{title}</span>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {fields.map((f) => (
          <div key={f}>
            <span className="font-medium">{f}:</span> {String(data[f] ?? "—")}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/** Custom config: a resource text field + a record id field. (Plan 2 upgrades to ReferenceInput.) */
function ReferenceRecordConfig({
  attrs,
  onChange,
}: BlockConfigProps<RefAttrs>) {
  return (
    <div className="flex flex-col gap-2 p-1">
      <label className="text-xs" htmlFor="reference-record-resource">
        Resource
      </label>
      <input
        id="reference-record-resource"
        className="rounded border px-2 py-1 text-sm"
        value={attrs.resource ?? ""}
        onChange={(e) => onChange({ resource: e.target.value })}
      />
      <label className="text-xs" htmlFor="reference-record-id">
        Record id
      </label>
      <input
        id="reference-record-id"
        className="rounded border px-2 py-1 text-sm"
        value={attrs.id == null ? "" : String(attrs.id)}
        onChange={(e) =>
          onChange({ id: e.target.value === "" ? null : e.target.value })
        }
      />
    </div>
  );
}

export const referenceRecordBlock = defineBlock<RefAttrs>({
  name: "referenceRecord",
  label: "Reference record",
  group: "data",
  icon: Boxes,
  keywords: ["record", "relation", "embed", "reference"],
  description: "Embed a live record",
  schema,
  config: ReferenceRecordConfig,
  render: ReferenceRecordRender,
});
