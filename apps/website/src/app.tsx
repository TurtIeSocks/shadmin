import { Routes, Route } from "react-router-dom";
import { PageAurora } from "@/components/aurora/page-aurora";
import { GlassFilter } from "@/components/aurora/glass-filter";
import { Landing } from "@/routes/landing";
import { DocsLayout } from "@/docs/docs-layout";
import { DocsHome } from "@/docs/docs-home";
import { ComponentsCatalog } from "@/docs/components-catalog";
import { ComponentPage } from "@/docs/component-page";
// SMOKE TEST ROUTE — remove after controller verification
import { SmokePage } from "@/docs/smoke-page";

function App() {
  return (
    <>
      <PageAurora />
      <GlassFilter />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/docs" element={<DocsLayout />}>
          <Route index element={<DocsHome />} />
          <Route path="components" element={<ComponentsCatalog />} />
          <Route path="components/:name" element={<ComponentPage />} />
          {/* SMOKE TEST — remove after controller verification */}
          <Route path="_smoke" element={<SmokePage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
