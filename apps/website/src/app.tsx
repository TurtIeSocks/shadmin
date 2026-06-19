import { Routes, Route } from "react-router-dom";
import { PageAurora } from "@/components/aurora/page-aurora";
import { GlassFilter } from "@/components/aurora/glass-filter";
import { Landing } from "@/routes/landing";
import { DocsLayout } from "@/docs/docs-layout";
import { DocsHome } from "@/docs/docs-home";
import { ComponentsCatalog } from "@/docs/components-catalog";
import { ComponentPage } from "@/docs/component-page";
import { MdxGuide } from "@/docs/mdx-guide";

// Eagerly load all guide MDX modules so MdxGuide can look them up by slug.
const guides = import.meta.glob<{
  default: React.ComponentType;
  frontmatter?: { title?: string; [key: string]: unknown };
}>("./docs/content/*.mdx", { eager: true });

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
          <Route path=":slug" element={<MdxGuide guides={guides} />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
