import { Check, Download, Filter, X } from "lucide-react";
import { cn } from "shadmin/lib/utils";

const rows = [
  { name: "Alice Kim", product: "Pro Plan", status: "Approved", selected: true },
  { name: "Ben Moss", product: "Starter", status: "Approved", selected: true },
  {
    name: "Clara Sol",
    product: "Enterprise",
    status: "Pending",
    selected: false,
  },
  { name: "Dan Tran", product: "Pro Plan", status: "Pending", selected: true },
  { name: "Eva Lee", product: "Starter", status: "Rejected", selected: false },
] as const;

const statusTone: Record<string, string> = {
  Approved:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20",
  Pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20",
  Rejected: "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20",
};

/** Hand-coded orders data-table with toolbar + bulk-action bar. */
export function DataTableMockup() {
  return (
    <div className="overflow-hidden rounded-[0.85rem] border border-border/40 bg-card text-left">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2.5">
        <span className="text-sm font-semibold text-foreground">Orders</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border/60 px-2.5 py-1 text-xs font-medium text-muted-foreground"
          >
            <Filter className="size-3.5" strokeWidth={1.75} />
            Filter
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border/60 px-2.5 py-1 text-xs font-medium text-muted-foreground"
          >
            <Download className="size-3.5" strokeWidth={1.75} />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="w-9 px-3 py-2" />
            <th className="px-3 py-2 font-medium">Customer</th>
            <th className="px-3 py-2 font-medium">Product</th>
            <th className="px-3 py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.name}
              className={cn(
                "border-b border-border/40 last:border-0",
                r.selected && "bg-violet-500/[0.06]",
              )}
            >
              <td className="px-3 py-2.5">
                <span
                  className={cn(
                    "flex size-4 items-center justify-center rounded border",
                    r.selected
                      ? "border-transparent bg-brand-gradient text-white"
                      : "border-border",
                  )}
                >
                  {r.selected && <Check className="size-3" strokeWidth={3} />}
                </span>
              </td>
              <td className="px-3 py-2.5 font-medium text-foreground">
                {r.name}
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">{r.product}</td>
              <td className="px-3 py-2.5">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
                    statusTone[r.status],
                  )}
                >
                  {r.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bulk-action bar */}
      <div className="flex items-center gap-3 border-t border-border/60 bg-muted/40 px-3 py-2.5">
        <span className="text-xs font-medium text-foreground">3 selected</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white"
          >
            <Check className="size-3.5" strokeWidth={2} />
            Approve
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border/60 px-2.5 py-1 text-xs font-medium text-muted-foreground"
          >
            <X className="size-3.5" strokeWidth={2} />
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
