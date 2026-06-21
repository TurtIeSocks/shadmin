import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { cn } from "shadmin/lib/utils";
import { Button } from "shadmin/components/ui/button";
import { DocSearch } from "@/components/doc-search";
import { useDocsUI } from "@/components/docs-ui-context";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/docs", label: "Docs" },
  { to: "/demo", label: "Demo" },
];

// Shared bar: a left slot (brand or sidebar controls), the nav links, then
// search + theme toggle pinned far right.
function NavBar({ left }: { left: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <nav className="flex h-14 items-center gap-4 px-4">
        {left}
        <ul className="flex items-center gap-4">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  cn(
                    "text-sm text-muted-foreground hover:text-foreground",
                    isActive && "font-medium text-foreground",
                  )
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-2">
          <DocSearch />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}

// Global nav — only for non-docs routes. Docs renders its own bar inside the
// app shell (DocsTopBar) so the sidebar can run full-height beside it.
export function SiteNav() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/docs")) return null;
  return (
    <NavBar
      left={
        <Link to="/" className="font-semibold">
          shadmin
        </Link>
      }
    />
  );
}

// Docs top bar — rendered inside the SidebarInset, over the content column.
export function DocsTopBar() {
  const { navOpen, toggleNav, setSheetOpen } = useDocsUI();
  return (
    <NavBar
      left={
        <>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-label="Open navigation"
            className="inline-flex size-9 items-center justify-center rounded-md text-foreground hover:bg-accent md:hidden"
          >
            <Menu className="size-4" />
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
            onClick={toggleNav}
            aria-label={navOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {navOpen ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeftOpen className="size-4" />
            )}
          </Button>
        </>
      }
    />
  );
}
