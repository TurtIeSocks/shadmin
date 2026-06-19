import { useParams, Link } from "react-router-dom";
import { GradientText } from "@/components/aurora/gradient-text";
import { Eyebrow } from "@/components/aurora/eyebrow";
import { InstallCommand } from "./install-command";
import { manifest } from "./manifest";

const items = manifest.items;
const itemMap = new Map(items.map((item) => [item.name, item]));

function TypeBadge({ type }: { type: string }) {
  const label = type.replace("registry:", "");
  return (
    <span className="glass inline-block rounded-full px-2.5 py-1 text-[11px] tracking-wide text-muted-foreground">
      {label}
    </span>
  );
}

export function ComponentPage() {
  const { name } = useParams<{ name: string }>();
  const item = name ? itemMap.get(name) : undefined;

  if (!item) {
    return (
      <div className="text-center py-16">
        <p className="text-2xl font-bold mb-3">Component not found</p>
        <p className="text-muted-foreground mb-6">
          No component named{" "}
          <code className="rounded bg-foreground/8 px-1.5 py-0.5 font-mono text-sm">
            {name}
          </code>{" "}
          exists in the registry.
        </p>
        <Link
          to="/docs/components"
          className="glass glass--l2 rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-foreground/5 transition-colors"
        >
          ← Back to Components
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Link
        to="/docs/components"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        ← All Components
      </Link>

      <div className="flex items-start gap-3 mb-2">
        <Eyebrow>{item.category}</Eyebrow>
        <TypeBadge type={item.type} />
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-3">
        <GradientText>{item.title}</GradientText>
      </h1>

      {item.description && (
        <p className="text-muted-foreground text-lg leading-relaxed mb-6">
          {item.description}
        </p>
      )}

      {item.docs && (
        <div className="glass rounded-xl px-4 py-3 mb-6 border-l-2 border-aurora/40">
          <p className="text-sm font-medium text-foreground mb-1">Note</p>
          <p className="text-sm text-muted-foreground">{item.docs}</p>
        </div>
      )}

      <div>
        <h2 className="text-base font-semibold mb-3">Installation</h2>
        <InstallCommand install={item.install} />
      </div>

      <div className="mt-8 pt-6 border-t border-border/40">
        <p className="text-xs text-muted-foreground font-mono">
          Registry name:{" "}
          <span className="text-foreground">@shadmin/{item.name}</span>
        </p>
      </div>
    </div>
  );
}
