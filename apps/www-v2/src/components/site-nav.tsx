import type { ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { cn } from "shadmin/lib/utils";
import { Brand } from "@/components/brand";
import { DocSearch } from "@/components/doc-search";
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
// SiteShell inset header (sidebar trigger + breadcrumb + actions).
export function SiteNav() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/docs")) return null;
  return (
    <NavBar
      left={
        <Link to="/" className="flex items-center text-base">
          <Brand />
        </Link>
      }
    />
  );
}
