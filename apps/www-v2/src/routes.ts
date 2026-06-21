import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("pages/home.tsx"),
  route("demo", "demo/demo-layout.tsx", [
    index("demo/launcher.tsx"),
    // route("login", "demo/login.tsx"),                 // Task 5
    // route("app/*", "demo/app/app-routes.tsx"),        // Task 6
    // route("components/*", "demo/gallery/gallery.tsx"), // Task 8
    // route("features/*", "demo/features/features.tsx"), // Phase 3
  ]),
  // docs-layout renders the sidebar at /docs; index = overview, * = a page.
  route("docs", "docs/docs-layout.tsx", [
    index("docs/docs-index.tsx"),
    route("*", "docs/mdx-page.tsx"),
  ]),
] satisfies RouteConfig;
