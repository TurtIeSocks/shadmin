import { CallToAction } from "./components/call-to-action";
import { Features } from "./components/features";
import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { Hero } from "./components/hero";
import { Deploy } from "./components/deploy";
import { AdvancedCapabilities } from "./components/advanced-capabilities";
import { Technos } from "./components/technos";
import { Why } from "./components/why";
import { Backends } from "./components/backends";
import { Open } from "./components/open";
import { ByDevelopers } from "./components/by-developers";
import { PageAurora } from "./components/aurora/page-aurora";
import { GlassSeparator } from "./components/aurora/glass-separator";

function App() {
  return (
    <>
      <PageAurora />
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

export default App;
