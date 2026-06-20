import { CallToAction } from "@/components/call-to-action";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Deploy } from "@/components/deploy";
import { AdvancedCapabilities } from "@/components/advanced-capabilities";
import { Technos } from "@/components/technos";
import { Why } from "@/components/why";
import { Backends } from "@/components/backends";
import { Open } from "@/components/open";
import { ByDevelopers } from "@/components/by-developers";
import { GlassSeparator } from "@/components/aurora/glass-separator";
import { usePageTitle } from "@/hooks/use-page-title";
import { useEffect } from "react";

export function Landing() {
  usePageTitle();

  // Hash links from other routes (e.g. "Features" → "/#features") hard-navigate
  // here; the browser's native scroll fires before React mounts the target, so
  // re-run it once the section exists.
  useEffect(() => {
    if (!window.location.hash) return;
    const el = document.querySelector(window.location.hash);
    if (el) requestAnimationFrame(() => el.scrollIntoView());
  }, []);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <GlassSeparator />
        <Technos />
        <GlassSeparator />
        <Features />
        <GlassSeparator />
        <AdvancedCapabilities />
        <GlassSeparator />
        <Backends />
        <GlassSeparator />
        <Deploy />
        <GlassSeparator />
        <Open />
        <GlassSeparator />
        <Why />
        <GlassSeparator />
        <ByDevelopers />
        <GlassSeparator />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
