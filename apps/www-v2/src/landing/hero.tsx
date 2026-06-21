import { links } from "./constants";
import { CtaButton, GhostButton } from "./cta-button";
import { DashboardMockup } from "./dashboard-mockup";
import { Reveal, RevealItem } from "./reveal";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-28 md:pb-28 md:pt-36">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <Reveal>
          <RevealItem
            as="span"
            className="inline-block rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-gradient"
          >
            Open source · shadcn registry
          </RevealItem>

          <RevealItem as="h1">
            <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-bold leading-[1.05] tracking-[-0.02em] text-foreground md:text-7xl">
              Build admin panels that{" "}
              <span className="text-brand-gradient">
                don&apos;t look like admin panels.
              </span>
            </h1>
          </RevealItem>

          <RevealItem
            as="p"
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
          >
            Production-ready shadcn blocks for internal tools, dashboards, B2B
            apps, and admin panels with React.
          </RevealItem>

          <RevealItem className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <CtaButton to={links.install}>Get started</CtaButton>
            <GhostButton to={links.demo}>Live demo</GhostButton>
          </RevealItem>
        </Reveal>

        {/* Dashboard mockup in a double-bezel panel */}
        <Reveal delay={0.1} className="mt-16">
          <RevealItem className="rounded-2xl bg-muted/40 p-1.5 ring-1 ring-border/60">
            <DashboardMockup />
          </RevealItem>
        </Reveal>
      </div>
    </section>
  );
}
