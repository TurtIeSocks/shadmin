import type { RouteRecord } from "vite-react-ssg";
import { App } from "@/app";
import { Home } from "@/pages/home";
import { DemoStub } from "@/pages/demo-stub";

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "demo", element: <DemoStub /> },
      // /docs/* added in Task 5
    ],
  },
];

// Expanded in Task 6 to enumerate every doc slug.
export async function includedRoutes(paths: string[]) {
  return paths;
}
