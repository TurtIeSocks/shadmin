import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("pages/home.tsx"),
  route("demo", "demo/demo-layout.tsx", [
    index("demo/demo-index.tsx"), // redirects /demo → /demo/app
    route("login", "demo/login.tsx"),
    // Pathless SHELL route: app/components/features get the flagship chrome
    // (Layout + 3-zone sidebar); login stays bare under DemoLayout.
    route("", "demo/shell/demo-shell.tsx", [
      route("app/*", "demo/app/app-routes.tsx"),
      route("components/*", "demo/gallery/gallery.tsx"),
      // route("features/*", "demo/features/features.tsx"), // Phase 3
    ]),
  ]),
  // docs-layout renders the sidebar at /docs; index = overview, * = a page.
  route("docs", "docs/docs-layout.tsx", [
    index("docs/docs-index.tsx"),
    route("components", "docs/docs-components.tsx"), // component directory splash
    route("*", "docs/mdx-page.tsx"),
  ]),
] satisfies RouteConfig;
