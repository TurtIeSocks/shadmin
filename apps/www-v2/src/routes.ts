import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  index("pages/home.tsx"),
  route("demo", "pages/demo-stub.tsx"),
  layout("docs/docs-layout.tsx", [route("docs/*", "docs/mdx-page.tsx")]),
] satisfies RouteConfig;
