import { ThemeToggle } from "./components/aurora/ThemeToggle";
import { CallToAction } from "./components/CallToAction";
import { Features } from "./components/Features";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Deploy } from "./components/Deploy";
import { Pricing } from "./components/Pricing";
import { AdvancedCapabilities } from "./components/AdvancedCapabilities";
import { Technos } from "./components/Technos";
import { Why } from "./components/Why";
import { Backends } from "./components/Backends";
import { Open } from "./components/Open";
import { ByDevelopers } from "./components/ByDevelopers";
import { Users } from "./components/Users";

function App() {
  return (
    <>
      <div className="fixed right-4 top-4 z-[100]"><ThemeToggle /></div>
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
        <Pricing />
        <Users />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}

export default App;
