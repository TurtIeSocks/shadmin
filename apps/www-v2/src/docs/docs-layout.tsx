import { ChevronRight, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import { cn } from "shadmin/lib/utils";
import { Button } from "shadmin/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "shadmin/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "shadmin/components/ui/sheet";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "shadmin/components/ui/sidebar";
import { navTree } from "./nav-content";
import { Toc } from "./toc";
import type { DocLeaf } from "./types";

interface NavProps {
  activeSlug: string;
  open: Set<string>;
  toggle: (dir: string, isOpen: boolean) => void;
  onNavigate?: () => void;
}

// Shared nav body — used by both the desktop sidebar and the mobile sheet.
function SectionNav({ activeSlug, open, toggle, onNavigate }: NavProps) {
  return (
    <SidebarContent className="gap-0 px-2 py-4">
      {navTree.map((section) => {
        const leaves = section.children.filter(
          (c): c is DocLeaf => c.kind === "leaf",
        );
        return (
          <Collapsible
            key={section.dir}
            open={open.has(section.dir)}
            onOpenChange={(o) => toggle(section.dir, o)}
            className="group/collapsible"
          >
            <SidebarGroup className="py-0.5">
              <SidebarGroupLabel
                asChild
                className="cursor-pointer text-xs font-semibold uppercase tracking-wide hover:text-foreground"
              >
                <CollapsibleTrigger>
                  {section.title}
                  <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {leaves.map((leaf) => (
                      <SidebarMenuItem key={leaf.slug}>
                        <SidebarMenuButton
                          asChild
                          isActive={leaf.slug === activeSlug}
                          size="sm"
                        >
                          <NavLink to={`/docs/${leaf.slug}`} onClick={onNavigate}>
                            {leaf.title}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        );
      })}
    </SidebarContent>
  );
}

export default function DocsLayout() {
  const { pathname } = useLocation();
  const activeSlug = pathname.replace(/^\/docs\/?/, "").replace(/\/+$/, "");
  const activeSection = navTree.find((s) =>
    s.children.some((c) => c.kind === "leaf" && c.slug === activeSlug),
  )?.dir;

  // Controlled open state so the active section auto-opens on client-side nav.
  const [open, setOpen] = useState<Set<string>>(
    () => new Set([activeSection, "getting-started"].filter(Boolean) as string[]),
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  // Desktop sidebar collapse (persisted). Defaults open; read pref on mount.
  const [navOpen, setNavOpen] = useState(true);
  useEffect(() => {
    if (localStorage.getItem("docs-nav-open") === "false") setNavOpen(false);
  }, []);
  const toggleNav = () =>
    setNavOpen((v) => {
      const next = !v;
      try {
        localStorage.setItem("docs-nav-open", String(next));
      } catch {
        /* ignore */
      }
      return next;
    });

  useEffect(() => {
    if (activeSection) {
      setOpen((prev) =>
        prev.has(activeSection) ? prev : new Set(prev).add(activeSection),
      );
    }
  }, [activeSection]);
  // Close the mobile sheet whenever the route changes.
  useEffect(() => setSheetOpen(false), [pathname]);

  const toggle = (dir: string, isOpen: boolean) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (isOpen) next.add(dir);
      else next.delete(dir);
      return next;
    });

  return (
    <SidebarProvider className="min-h-0">
      {/* Desktop sidebar (hidden on mobile; collapsible via the toolbar toggle) */}
      <Sidebar
        collapsible="none"
        className={cn(
          "sticky top-14 hidden h-[calc(100svh-3.5rem)] border-r bg-transparent md:flex",
          !navOpen && "md:hidden",
        )}
      >
        <SectionNav activeSlug={activeSlug} open={open} toggle={toggle} />
      </Sidebar>

      <SidebarInset className="bg-transparent">
        {/* Utility bar: mobile sheet trigger + desktop collapse toggle */}
        <div className="sticky top-14 z-20 flex items-center gap-1 border-b bg-background/80 px-4 py-2 backdrop-blur">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger className="inline-flex items-center gap-2 text-sm font-medium md:hidden">
              <Menu className="size-4" />
              Menu
            </SheetTrigger>
            <SheetContent side="left" className="w-72 overflow-y-auto p-0">
              <SheetTitle className="sr-only">Documentation navigation</SheetTitle>
              <SectionNav
                activeSlug={activeSlug}
                open={open}
                toggle={toggle}
                onNavigate={() => setSheetOpen(false)}
              />
            </SheetContent>
          </Sheet>
          <Button
            variant="ghost"
            size="icon"
            className="hidden size-7 md:inline-flex"
            onClick={toggleNav}
            aria-label={navOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {navOpen ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeftOpen className="size-4" />
            )}
          </Button>
        </div>

        <div className="mx-auto w-full max-w-6xl px-6 py-10">
          <div className="flex justify-center gap-12">
            <div className="w-full min-w-0 max-w-3xl">
              <Outlet />
            </div>
            <Toc />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
