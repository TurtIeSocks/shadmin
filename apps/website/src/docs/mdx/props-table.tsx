/**
 * <PropsTable name="ComponentName" />
 *
 * Reads props/<kebab-name>.json (loaded via import.meta.glob).
 * Renders gracefully when JSON is missing.
 */

interface Prop {
  name: string;
  type: string;
  optional: boolean;
  comment: string;
}

interface PropsEntry {
  name: string;
  props: Prop[];
}

interface PropsTableProps {
  name: string;
}

// Compound abbreviations whose default split is wrong.
// Keep in sync with apps/docs/src/components/props-table.astro.
const ABBREVIATION_OVERRIDES: Record<string, string> = {
  BBox: "bbox",
  GeoJson: "geojson",
};

function kebabName(name: string): string {
  let s = name;
  for (const [pascal, kebab] of Object.entries(ABBREVIATION_OVERRIDES)) {
    s = s.replace(new RegExp(pascal, "g"), kebab);
  }
  return s
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

// Import all props JSONs eagerly. Task 4 copies them to this location.
const propModules = import.meta.glob<PropsEntry>(
  "../content/props/*.json",
  { eager: true, import: "default" },
);

const byComponent = new Map<string, PropsEntry>(
  Object.entries(propModules).map(([path, mod]) => {
    const file = path.split("/").pop() ?? "";
    return [file.replace(/\.json$/, ""), mod];
  }),
);

export function PropsTable({ name }: PropsTableProps) {
  const key = kebabName(name);
  const entry = byComponent.get(key);
  const missing = !entry;
  const props = entry?.props ?? [];

  if (missing) {
    return (
      <p className="text-muted-foreground text-sm italic my-4">
        No prop metadata for &ldquo;{name}&rdquo;. Run{" "}
        <code className="font-mono">pnpm docs:gen-props</code> to regenerate.
      </p>
    );
  }

  if (props.length === 0) {
    return (
      <p className="text-muted-foreground text-sm italic my-4">
        This component takes no props.
      </p>
    );
  }

  return (
    <div className="my-4 overflow-x-auto rounded-lg border border-border/40">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/40 bg-muted/30 text-left">
            <th className="px-4 py-2 font-semibold">Prop</th>
            <th className="px-4 py-2 font-semibold">Type</th>
            <th className="px-4 py-2 font-semibold">Required</th>
            <th className="px-4 py-2 font-semibold">Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((p) => (
            <tr
              key={p.name}
              className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors"
            >
              <td className="px-4 py-2">
                <code className="font-mono text-xs bg-muted/50 rounded px-1 py-0.5">
                  {p.name}
                </code>
              </td>
              <td className="px-4 py-2">
                <code className="font-mono text-xs text-muted-foreground">
                  {p.type}
                </code>
              </td>
              <td className="px-4 py-2 text-center">
                {p.optional ? "—" : "Yes"}
              </td>
              <td className="px-4 py-2 text-muted-foreground">
                {p.comment || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PropsTable;
