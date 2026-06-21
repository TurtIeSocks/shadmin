import { ThemeProvider } from "next-themes";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { LinksFunction, MetaFunction } from "react-router";
import { SiteNav } from "@/components/site-nav";
import "./index.css";

// No-flash theme bootstrap. Runs before hydration so the prerendered (default)
// markup is corrected to the user's preference before paint. Shares the "theme"
// localStorage key with next-themes; supports light / dark / system.
const themeScript = `(() => {
  // Mark JS as active so scroll-reveal content is hidden (then animated in) only
  // when JS can reveal it again — without JS the content stays visible.
  document.documentElement.classList.add("js");
  try {
    const t = localStorage.getItem("theme") || "system";
    const sys = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", t === "dark" || (t === "system" && sys));
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
  { rel: "icon", type: "image/svg+xml", href: "/shadmin-favicon.svg" },
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-dvh flex flex-col">
            <SiteNav />
            {children}
          </div>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}
