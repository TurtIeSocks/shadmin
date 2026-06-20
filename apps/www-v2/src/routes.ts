import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("pages/home.tsx"),
  route("demo", "pages/demo-stub.tsx"),
  // docs-layout renders the sidebar at /docs; index = overview, * = a page.
  route("docs", "docs/docs-layout.tsx", [
    index("docs/docs-index.tsx"),
    route("*", "docs/mdx-page.tsx"),
  ]),
] satisfies RouteConfig;
