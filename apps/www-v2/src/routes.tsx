import type { RouteRecord } from "vite-react-ssg";
import { App } from "@/app";
import { Home } from "@/pages/home";
import { DemoStub } from "@/pages/demo-stub";
import { DocsLayout } from "@/docs/docs-layout";
import { MdxPage } from "@/docs/mdx-page";
import { docSlugs } from "@/docs/nav-content";

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "demo", element: <DemoStub /> },
      {
        path: "docs",
        element: <DocsLayout />,
        children: [{ path: "*", element: <MdxPage /> }],
      },
    ],
  },
];

// Expanded in Task 6 to enumerate every doc slug.
export async function includedRoutes(paths: string[]) {
  const staticPaths = paths.filter((p) => !p.includes("*"));
  const docPaths = docSlugs.map((s) => `/docs/${s}`);
  return [...staticPaths, ...docPaths];
}
