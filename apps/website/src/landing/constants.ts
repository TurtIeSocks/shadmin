/** Shared brand motion ease — matches docs-index.tsx. */
export const ease = "cubic-bezier(0.32,0.72,0,1)";

/**
 * Inner card surface that sits inside a `BezelPanel` (and is reused by the
 * mockups' window chrome): subtle border + card background + the shared
 * 0.85rem corner radius. Compose with `cn(insetCard, …)` for extra layout.
 */
export const insetCard = "rounded-[0.85rem] border border-border/40 bg-card";

/** Canonical external/internal links used across the landing. */
export const links = {
  install: "/docs/getting-started/install",
  demo: "/demo",
  docs: "/docs",
  dataProviders: "/docs/app-config/data-providers",
  github: "https://github.com/TurtIeSocks/shadmin",
} as const;
