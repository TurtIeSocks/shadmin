import { Link } from "react-router-dom";
import { GradientText } from "@/components/aurora/gradient-text";
import { Eyebrow } from "@/components/aurora/eyebrow";
import { manifest } from "./manifest";
import { usePageTitle } from "@/hooks/use-page-title";

export function DocsHome() {
  usePageTitle("Documentation");
  const totalItems = manifest.items.length;
  const totalGroups = manifest.nav.length;

  return (
    <div className="max-w-2xl">
      <Eyebrow className="mb-4">Documentation</Eyebrow>

      <h1 className="text-3xl font-bold tracking-tight mb-4">
        Welcome to <GradientText>shadmin</GradientText>
      </h1>

      <p className="text-muted-foreground text-lg leading-relaxed mb-8">
        shadmin is a registry of shadcn/ui-compatible components built on{" "}
        <a
          href="https://marmelab.com/react-admin"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline underline-offset-4 hover:text-aurora transition-colors"
        >
          react-admin
        </a>{" "}
        headless primitives. Drop in fully-wired admin interfaces — data grids,
        forms, auth flows, and more — with a single{" "}
        <code className="rounded bg-foreground/8 px-1.5 py-0.5 text-sm font-mono">
          shadcn add
        </code>{" "}
        command.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-foreground">{totalItems}</p>
          <p className="text-sm text-muted-foreground mt-1">Components</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-foreground">{totalGroups}</p>
          <p className="text-sm text-muted-foreground mt-1">Categories</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          to="/docs/components"
          className="inline-flex items-center gap-2 glass glass--l2 rounded-full px-5 py-2.5 text-sm font-medium text-foreground hover:bg-foreground/5 transition-colors"
        >
          Browse Components →
        </Link>
      </div>
    </div>
  );
}
