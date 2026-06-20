import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { LinksFunction, MetaFunction } from "react-router";
import { SiteNav } from "@/components/site-nav";
import "./index.css";

// Dark-theme bootstrap script, carried over from the old index.html. Runs before
// hydration so the page never flashes light. Inlined via dangerouslySetInnerHTML
// so RR7 emits it verbatim into the prerendered <head>.
const themeScript = `(() => {
  try {
    const t = localStorage.getItem("theme");
    document.documentElement.classList.toggle("dark", t !== "light");
  } catch {
    document.documentElement.classList.add("dark");
  }
})();`;

export const meta: MetaFunction = () => [
  { title: "Shadmin | Open Source App Components" },
  {
    name: "description",
    content:
      "Powerful open-source shadcn blocks to build beautiful internal tools, admin panels, and dashboards with React.",
  },
  { property: "og:title", content: "Shadmin" },
  {
    property: "og:description",
    content:
      "Powerful open-source shadcn blocks to build beautiful internal tools, admin panels, and dashboards with React.",
  },
  { property: "og:type", content: "website" },
  { property: "og:url", content: "https://shadmin.turtlesocks.dev" },
  {
    property: "og:image",
    content: "https://shadmin.turtlesocks.dev/img/shadmin-banner.png",
  },
];

export const links: LinksFunction = () => [
  { rel: "icon", type: "image/svg+xml", href: "/img/icon.png" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="min-h-dvh flex flex-col">
          <SiteNav />
          {children}
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}
