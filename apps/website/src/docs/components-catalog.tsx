import { Link } from "react-router-dom";
import { GradientText } from "@/components/aurora/gradient-text";
import { Eyebrow } from "@/components/aurora/eyebrow";
import { manifest } from "./manifest";
import type { ManifestItem } from "./types";

const items = manifest.items;
const nav = manifest.nav;

// Build a lookup map for quick item retrieval
const itemMap = new Map(items.map((item) => [item.name, item]));

export function ComponentsCatalog() {
  return (
    <div>
      <Eyebrow className="mb-4">Component Catalog</Eyebrow>
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        All <GradientText>Components</GradientText>
      </h1>
      <p className="text-muted-foreground mb-8">
        {items.length} components across {nav.length} categories. Each component
        is installable via shadcn CLI.
      </p>

      <div className="space-y-10">
        {nav.map((group) => {
          const groupItems = group.items
            .map((navItem) => itemMap.get(navItem.name))
            .filter((item): item is ManifestItem => item !== undefined);

          if (groupItems.length === 0) return null;

          return (
            <section key={group.category}>
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-border/40">
                {group.label}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({groupItems.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupItems.map((item) => (
                  <Link
                    key={item.name}
                    to={`/docs/${item.name}`}
                    className="glass rounded-xl p-4 hover:bg-foreground/5 transition-colors group"
                  >
                    <p className="font-medium text-sm text-foreground group-hover:text-aurora transition-colors">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <p className="mt-2 text-[10px] text-muted-foreground/60 font-mono">
                      {item.type.replace("registry:", "")}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
