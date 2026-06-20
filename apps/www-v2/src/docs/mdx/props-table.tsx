/**
 * PropsTable — renders a styled props reference table inside MDX.
 * Wraps itself in not-prose so Tailwind Typography doesn't override styles.
 */

interface PropRow {
  prop: string;
  type: string;
  default?: string;
  description: string;
}

interface PropsTableProps {
  rows: PropRow[];
}

export function PropsTable({ rows }: PropsTableProps) {
  return (
    <div className="not-prose my-6 overflow-x-auto rounded-lg border border-border/60">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/40">
            <th className="px-4 py-2 text-left font-semibold text-foreground">
              Prop
            </th>
            <th className="px-4 py-2 text-left font-semibold text-foreground">
              Type
            </th>
            <th className="px-4 py-2 text-left font-semibold text-foreground">
              Default
            </th>
            <th className="px-4 py-2 text-left font-semibold text-foreground">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.prop}
              className={
                i % 2 === 0 ? "bg-background" : "bg-muted/20"
              }
            >
              <td className="px-4 py-2 font-mono text-xs text-foreground">
                {row.prop}
              </td>
              <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                {row.type}
              </td>
              <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                {row.default ?? "—"}
              </td>
              <td className="px-4 py-2 text-muted-foreground">
                {row.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
