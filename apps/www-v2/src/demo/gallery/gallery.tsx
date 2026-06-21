/**
 * gallery.tsx — route module for /demo/components/*
 *
 * Slug routing:
 *   - slug has an example → render ExampleFrame (lazy component + raw source)
 *   - slug is a known docs component slug with NO example → amber "Not yet covered" stub
 *   - unknown slug → 404-style message
 */
import { Suspense, lazy, type ComponentType } from "react";
import { useParams } from "react-router";
import {
  exampleModules,
  exampleRawSources,
  exampleSlugs,
  componentDocSlugs,
  slugToKey,
} from "./examples-nav";
import { ExampleFrame } from "./example-frame";
import { ComponentDirectory } from "@/docs/component-directory";

const exampleSlugSet = new Set(exampleSlugs);
const componentDocSlugSet = new Set(componentDocSlugs);

// Cache one STABLE lazy component per example key. Creating lazy() inside
// render gives a fresh component identity every render, so React's Suspense
// never settles on the new example during client-side navigation — the page
// shows stale content until a hard reload. A module-level cache keyed by the
// example key makes each example's lazy stable, so soft nav swaps cleanly.
const lazyCache = new Map<string, ComponentType>();
function getExampleComponent(key: string): ComponentType {
  let C = lazyCache.get(key);
  if (!C) {
    C = lazy(exampleModules[key] as () => Promise<{ default: ComponentType }>);
    lazyCache.set(key, C);
  }
  return C;
}

export default function Gallery() {
  const slug = (useParams()["*"] ?? "").replace(/\/+$/, "");

  const key = slugToKey(slug);
  const hasExample = exampleSlugSet.has(slug);
  const isKnownDoc = componentDocSlugSet.has(slug);

  // Gallery landing: the component directory, linking into the live examples.
  if (!slug) {
    return (
      <div className="mx-auto max-w-5xl p-6 lg:p-8">
        <ComponentDirectory basePath="/demo/components" />
      </div>
    );
  }

  if (hasExample) {
    const rawSource = exampleRawSources[key] ?? "";
    const ExampleComponent = getExampleComponent(key);

    return (
      // key={slug} forces a clean remount per example so nothing leaks across
      // client-side navigations.
      <div key={slug} className="p-8 max-w-4xl">
        <ExampleFrame
          slug={slug}
          component={
            <Suspense
              fallback={
                <span className="text-sm text-muted-foreground">Loading…</span>
              }
            >
              <ExampleComponent />
            </Suspense>
          }
          source={rawSource}
        />
      </div>
    );
  }

  if (isKnownDoc) {
    return (
      <div className="p-8 max-w-4xl">
        <div className="rounded-xl border border-amber-400/60 bg-amber-50 p-6 dark:bg-amber-950/30">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
            Not yet covered
          </p>
          <p className="mt-1 text-sm text-amber-600 dark:text-amber-500">
            No demo example exists for{" "}
            <code className="font-mono font-medium">{slug}</code> yet.
          </p>
          <a
            href={`/docs/${slug}`}
            className="mt-3 inline-block text-sm underline text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
          >
            View docs →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 text-muted-foreground">
      Unknown component: <code className="font-mono">{slug}</code>
    </div>
  );
}
