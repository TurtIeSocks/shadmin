import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { GlassPanel } from "@/components/aurora/glass-panel";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { manifest } from "./manifest";
import type { NavGroup } from "./types";

const nav = manifest.nav;

const GUIDES = [
  { label: "Introduction", href: "/docs" },
  { label: "Components", href: "/docs/components" },
];

function SidebarNavGroup({ group }: { group: NavGroup }) {
  const location = useLocation();
  const isGroupActive = group.items.some(
    (item) => location.pathname === `/docs/components/${item.name}`,
  );
  const [open, setOpen] = useState(isGroupActive);

  useEffect(() => {
    if (isGroupActive) setOpen(true);
  }, [isGroupActive]);

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>{group.label}</span>
        <span
          className={cn(
            "transition-transform duration-200 text-muted-foreground",
            open ? "rotate-90" : "",
          )}
        >
          ›
        </span>
      </button>
      {open && (
        <ul className="mt-1 space-y-0.5 pl-2">
          {group.items.map((item) => (
            <li key={item.name}>
              <NavLink
                to={`/docs/components/${item.name}`}
                className={({ isActive }) =>
                  cn(
                    "block rounded-lg px-2 py-1 text-sm transition-colors",
                    isActive
                      ? "bg-foreground/8 text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5",
                  )
                }
              >
                {item.title}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Sidebar() {
  return (
    <nav aria-label="Documentation" className="h-full overflow-y-auto py-6 px-4">
      {/* Guides section */}
      <div className="mb-6">
        <p className="mb-2 px-2 py-1.5 text-xs font-semibold tracking-wider uppercase text-muted-foreground">
          Guides
        </p>
        <ul className="space-y-0.5">
          {GUIDES.map((guide) => (
            <li key={guide.href}>
              <NavLink
                to={guide.href}
                end
                className={({ isActive }) =>
                  cn(
                    "block rounded-lg px-2 py-1 text-sm transition-colors",
                    isActive
                      ? "bg-foreground/8 text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5",
                  )
                }
              >
                {guide.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Component nav groups */}
      <div>
        <p className="mb-2 px-2 py-1.5 text-xs font-semibold tracking-wider uppercase text-muted-foreground">
          Components
        </p>
        {nav.map((group) => (
          <SidebarNavGroup key={group.category} group={group} />
        ))}
      </div>
    </nav>
  );
}

export function DocsLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Mobile sidebar toggle */}
      <div className="md:hidden sticky top-20 z-40 px-4 py-2">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen((v) => !v)}
          className="glass glass--l2 rounded-lg px-3 py-1.5 text-sm font-medium text-foreground flex items-center gap-2"
        >
          <span className="text-xs">☰</span>
          Navigation
        </button>
      </div>

      <div className="flex flex-1 mx-auto w-full max-w-7xl px-4 gap-6 py-8">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-60 shrink-0">
          <GlassPanel level={2} className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-hidden">
            <Sidebar />
          </GlassPanel>
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-30 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-72 z-40"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassPanel level={2} className="h-full overflow-hidden">
                <Sidebar />
              </GlassPanel>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <GlassPanel level={2} className="min-h-96 p-6 md:p-8">
            <Outlet />
          </GlassPanel>
        </main>
      </div>

      <Footer />
    </div>
  );
}
