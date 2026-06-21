import { NavLink } from "react-router";
import { cn } from "shadmin/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/docs", label: "Docs" },
  { to: "/demo", label: "Demo" },
];

export function SiteNav() {
  return (
    <header className="border-b">
      <nav className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4">
        <span className="font-semibold">shadmin</span>
        <ul className="flex items-center gap-4">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  cn(
                    "text-sm text-muted-foreground hover:text-foreground",
                    isActive && "text-foreground font-medium",
                  )
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
