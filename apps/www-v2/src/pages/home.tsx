import type { MetaFunction } from "react-router";
import { Advanced } from "@/landing/advanced";
import { Backends } from "@/landing/backends";
import { CodeShowcase } from "@/landing/code-showcase";
import { Deploy } from "@/landing/deploy";
import { Features } from "@/landing/features";
import { FinalCta } from "@/landing/final-cta";
import { Hero } from "@/landing/hero";
import { LandingFooter } from "@/landing/landing-footer";
import { OpenSource } from "@/landing/open-source";
import { SectionDivider } from "@/landing/section";
import { TechLogos } from "@/landing/tech-logos";
import { Why } from "@/landing/why";

// biome-ignore lint/style/useComponentExportOnlyModules: `meta` is a React Router route export and must live in the route module.
export const meta: MetaFunction = () => [
  { title: "Shadmin — Open-source shadcn admin components" },
  {
    name: "description",
    content:
      "Production-ready shadcn blocks for internal tools, dashboards, B2B apps, and admin panels with React.",
  },
];

/** Marketing landing page — composes the landing sections top to bottom. */
export default function Home() {
  return (
    <main>
      <Hero />
      <SectionDivider />
      <TechLogos />
      <SectionDivider />
      <Features />
      <SectionDivider />
      <Advanced />
      <SectionDivider />
      <Backends />
      <SectionDivider />
      <Deploy />
      <SectionDivider />
      <OpenSource />
      <SectionDivider />
      <Why />
      <SectionDivider />
      <CodeShowcase />
      <FinalCta />
      <LandingFooter />
    </main>
  );
}
