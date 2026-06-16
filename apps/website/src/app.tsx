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

function App() {
  return (
    <>
      <PageAurora />
      <Header />
      <main>
        <Hero />
        <Technos />
        <Features />
        <AdvancedCapabilities />
        <Backends />
        <Deploy />
        <Open />
        <Why />
        <ByDevelopers />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}

export default App;
