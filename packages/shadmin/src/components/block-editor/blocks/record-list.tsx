import { z } from "zod";
import { List as ListIcon } from "lucide-react";
import { useGetList, type RaRecord } from "shadmin-core";
import {
  defineBlock,
  type BlockRenderProps,
  type BlockConfigProps,
} from "../define-block";
import { BlockEmpty, BlockSkeleton, BlockError } from "./block-states";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const schema = z.object({
  resource: z.string().default(""),
  perPage: z.number().default(5),
  fields: z.array(z.string()).optional(),
});
type ListAttrs = z.infer<typeof schema>;

function RecordListRender({ attrs }: BlockRenderProps<ListAttrs>) {
  const enabled = Boolean(attrs.resource);
  const { data, isPending, error } = useGetList(
    attrs.resource,
    { pagination: { page: 1, perPage: attrs.perPage ?? 5 } },
    { enabled },
  );

  if (!enabled) return <BlockEmpty label="Pick a resource to list" />;
  if (isPending) return <BlockSkeleton />;
  if (error) return <BlockError label="List unavailable" />;

  const records: RaRecord[] = data ?? [];
  if (records.length === 0) return <BlockEmpty label="No records" />;

  const fields =
    attrs.fields && attrs.fields.length > 0
      ? attrs.fields
      : Object.keys(records[0])
          .filter((k) => k !== "id")
          .slice(0, 3);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {fields.map((f) => (
            <TableHead key={f} className="capitalize">
              {f}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((r) => (
          <TableRow key={String(r.id)}>
            {fields.map((f) => (
              <TableCell key={f}>
                {String((r as Record<string, unknown>)[f] ?? "—")}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RecordListConfig({ attrs, onChange }: BlockConfigProps<ListAttrs>) {
  return (
    <div className="flex w-56 flex-col gap-2 p-1">
      <Label className="text-xs">Resource</Label>
      <Input
        value={attrs.resource}
        onChange={(e) => onChange({ resource: e.target.value })}
      />
      <Label className="text-xs">Rows</Label>
      <Input
        type="number"
        value={attrs.perPage}
        onChange={(e) => onChange({ perPage: Number(e.target.value) || 5 })}
      />
    </div>
  );
}

export const recordListBlock = defineBlock<ListAttrs>({
  name: "recordList",
  label: "Record list",
  group: "data",
  icon: ListIcon,
  keywords: ["list", "table", "records", "collection"],
  description: "Embed a live list from a resource",
  schema,
  config: RecordListConfig,
  render: RecordListRender,
});
