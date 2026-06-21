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
import { TechLogos } from "@/landing/tech-logos";
import { Why } from "@/landing/why";

export const meta: MetaFunction = () => [
  { title: "Shadmin — Open-source shadcn admin components" },
  {
    name: "description",
    content:
      "Production-ready shadcn blocks for internal tools, dashboards, B2B apps, and admin panels with React.",
  },
];

export default function Home() {
  return (
    <main>
      <Hero />
      <TechLogos />
      <Features />
      <Advanced />
      <Backends />
      <Deploy />
      <OpenSource />
      <Why />
      <CodeShowcase />
      <FinalCta />
      <LandingFooter />
    </main>
  );
}
