/**
 * features.tsx — route module for /demo/features/*
 *
 *   no slug → the Features landing (cards)
 *   slug    → render the feature demo module under a title/blurb header
 *   unknown → a small "unknown feature" message
 */
import { Suspense, lazy, type ComponentType } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link, useParams } from "react-router";
import {
  FEATURE_BY_SLUG,
  FEATURES,
  featureModules,
  featureSlugs,
  slugToKey,
} from "./features-nav";

const featureSlugSet = new Set(featureSlugs);
const ease = "cubic-bezier(0.32,0.72,0,1)";

// Stable lazy component per module key (see gallery.tsx for the why: a fresh
// lazy() per render breaks Suspense settling on client-side nav).
const lazyCache = new Map<string, ComponentType>();
function getFeatureComponent(key: string): ComponentType {
  let C = lazyCache.get(key);
  if (!C) {
    C = lazy(featureModules[key] as () => Promise<{ default: ComponentType }>);
    lazyCache.set(key, C);
  }
  return C;
}

export default function Features() {
  const slug = (useParams()["*"] ?? "").replace(/\/+$/, "");

  if (!slug) return <FeaturesLanding />;

  if (!featureSlugSet.has(slug)) {
    return (
      <div className="p-8 text-muted-foreground">
        Unknown feature: <code className="font-mono">{slug}</code>
      </div>
    );
  }

  const meta = FEATURE_BY_SLUG[slug];
  const FeatureComponent = getFeatureComponent(slugToKey(slug));

  return (
    // key={slug} forces a clean remount per feature across client navigations.
    <div key={slug} className="mx-auto max-w-5xl p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {meta.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{meta.blurb}</p>
      </header>
      <Suspense
        fallback={<div className="text-sm text-muted-foreground">Loading…</div>}
      >
        <FeatureComponent />
      </Suspense>
    </div>
  );
}

/** The /demo/features index: a hero + one card per feature. */
function FeaturesLanding() {
  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      <span className="inline-block rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-gradient">
        Features
      </span>
      <h1 className="mt-5 max-w-xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Beyond the basics
      </h1>
      <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted-foreground">
        The bigger integrations — maps, realtime, importers, editors — shown
        end-to-end against the demo data.
      </p>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <Link
              key={f.slug}
              to={`/demo/features/${f.slug}`}
              className="group block rounded-2xl bg-muted/40 p-1.5 ring-1 ring-border/60 transition-all duration-500 hover:-translate-y-0.5 hover:bg-muted hover:ring-border"
              style={{
                transitionTimingFunction: ease,
                animation: `docs-rise 0.55s ${ease} both`,
                animationDelay: `${i * 45}ms`,
              }}
            >
              <div className="h-full rounded-[0.85rem] border border-border/40 bg-card p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm shadow-indigo-500/20">
                    <Icon className="size-[1.15rem]" strokeWidth={1.5} />
                  </span>
                  <span className="font-semibold leading-tight text-foreground">
                    {f.title}
                  </span>
                  <ArrowUpRight
                    className="ml-auto size-4 text-muted-foreground transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                    strokeWidth={1.5}
                    style={{ transitionTimingFunction: ease }}
                  />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {f.blurb}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
