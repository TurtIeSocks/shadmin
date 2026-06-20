import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { GlassPanel } from "@/components/aurora/glass-panel";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { docsNav, type DocsNavGroup } from "./guides-nav";

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "block rounded-lg px-2 py-1 text-sm transition-colors",
    isActive
      ? "bg-foreground/8 text-foreground font-medium"
      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5",
  );

function SidebarNavGroup({ group }: { group: DocsNavGroup }) {
  const location = useLocation();
  const isGroupActive = group.items.some(
    (item) => location.pathname === `/docs/${item.slug}`,
  );
  const [open, setOpen] = useState(isGroupActive);

  useEffect(() => {
    if (isGroupActive) setOpen(true);
  }, [isGroupActive]);

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="truncate">{group.label}</span>
        <span
          className={cn(
            "shrink-0 transition-transform duration-200 text-muted-foreground",
            open ? "rotate-90" : "",
          )}
        >
          ›
        </span>
      </button>
      {open && (
        <ul className="mt-1 space-y-0.5 pl-2">
          {group.items.map((item) => (
            <li key={item.slug}>
              <NavLink to={`/docs/${item.slug}`} className={navItemClass}>
                {item.label}
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
    <nav aria-label="Documentation" className="py-6 px-4">
      {/* Overview */}
      <div className="mb-6">
        <p className="mb-2 px-2 py-1.5 text-xs font-semibold tracking-wider uppercase text-muted-foreground">
          Overview
        </p>
        <ul className="space-y-0.5">
          <li>
            <NavLink to="/docs" end className={navItemClass}>
              Introduction
            </NavLink>
          </li>
          <li>
            <NavLink to="/docs/components" className={navItemClass}>
              All Components
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Ported sidebar groups */}
      <div>
        {docsNav.map((group) => (
          <SidebarNavGroup key={group.label} group={group} />
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
          <GlassPanel
            level={2}
            className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto"
          >
            <Sidebar />
          </GlassPanel>
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-30 md:hidden">
            {/* Scrim: a real button so closing is keyboard-accessible. The
                panel is a sibling (not a child), so clicks inside it don't
                reach the scrim — no stopPropagation needed. */}
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute inset-0 bg-background/40"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-72 z-40">
              <GlassPanel level={2} className="h-full overflow-y-auto">
                <Sidebar />
              </GlassPanel>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <GlassPanel level={2} className="p-6 md:p-8">
            <Outlet />
          </GlassPanel>
        </main>
      </div>

      <Footer />
    </div>
  );
}
