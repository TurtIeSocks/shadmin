import { ArrowDown, Database, LayoutDashboard } from "lucide-react";
import { links } from "./constants";
import { CtaButton } from "./cta-button";
import { Reveal, RevealItem } from "./reveal";
import { Eyebrow, Heading, Lead, Section } from "./section";

const backendLogos = [
  { label: "Supabase", src: "/img/supabase-logo-icon.svg" },
  { label: "Appwrite", src: "/img/appwrite-logo.svg" },
  { label: "Firebase", src: "/img/firebase-logo.svg" },
  { label: "Strapi", src: "/img/strapi-logo.svg" },
  { label: "Hasura", src: "/img/hasura-logo.svg" },
];

function FlowBox({
  label,
  icon: Icon,
  brand,
}: {
  label: string;
  icon: typeof Database;
  brand?: boolean;
}) {
  return (
    <div
      className={
        brand
          ? "flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3 font-semibold text-white shadow-sm shadow-indigo-500/20"
          : "flex w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-3 font-medium text-foreground"
      }
    >
      <Icon className="size-4" strokeWidth={1.75} />
      {label}
    </div>
  );
}

function MonoPill({ children }: { children: string }) {
  return (
    <span className="rounded-md border border-border/60 bg-muted/60 px-2.5 py-1 font-mono text-xs text-muted-foreground">
      {children}
    </span>
  );
}

export function Backends() {
  return (
    <Section>
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Copy + logo chips */}
        <Reveal>
          <Eyebrow>Effortless Integration</Eyebrow>
          <Heading>
            Connect to <span className="text-brand-gradient">Any Backend</span>
          </Heading>
          <Lead>
            Shadmin is designed to fit seamlessly with the tools you already
            know and love. As a single-page app, it connects to any
            backend—REST, GraphQL, or custom APIs—and works with any
            authentication provider.
          </Lead>

          <RevealItem className="mt-8 flex flex-wrap items-center gap-3">
            {backendLogos.map((logo) => (
              <span
                key={logo.label}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3.5 py-1.5 text-sm font-medium text-foreground"
              >
                <img
                  src={logo.src}
                  alt=""
                  aria-hidden
                  width={18}
                  height={18}
                  className="size-[18px]"
                />
                {logo.label}
              </span>
            ))}
            <span className="inline-flex items-center rounded-full border border-dashed border-border px-3.5 py-1.5 text-sm font-medium text-muted-foreground">
              Works with any REST or GraphQL API
            </span>
          </RevealItem>

          <RevealItem className="mt-9">
            <CtaButton to={links.dataProviders}>Learn More</CtaButton>
          </RevealItem>
        </Reveal>

        {/* Data-flow diagram */}
        <Reveal delay={0.1}>
          <RevealItem className="rounded-2xl bg-muted/40 p-1.5 ring-1 ring-border/60">
            <div className="flex flex-col items-center gap-3 rounded-[0.85rem] border border-border/40 bg-card p-6">
              <FlowBox label="Your App" icon={LayoutDashboard} />
              <MonoPill>useGetList(&apos;posts&apos;)</MonoPill>
              <ArrowDown
                className="size-4 text-muted-foreground"
                strokeWidth={1.75}
              />
              <FlowBox label="dataProvider" icon={Database} brand />
              <MonoPill>REST · GraphQL · any API</MonoPill>
              <ArrowDown
                className="size-4 text-muted-foreground"
                strokeWidth={1.75}
              />
              <FlowBox label="Your Backend" icon={Database} />
            </div>
          </RevealItem>
        </Reveal>
      </div>
    </Section>
  );
}
