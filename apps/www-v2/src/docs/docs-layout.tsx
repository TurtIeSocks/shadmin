import { ChevronRight, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
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
      {/* Desktop sidebar (hidden on mobile) */}
      <Sidebar
        collapsible="none"
        className="sticky top-14 hidden h-[calc(100svh-3.5rem)] border-r bg-transparent md:flex"
      >
        <SectionNav activeSlug={activeSlug} open={open} toggle={toggle} />
      </Sidebar>

      <SidebarInset className="bg-transparent">
        {/* Mobile menu bar with a sheet trigger */}
        <div className="sticky top-14 z-20 flex items-center border-b bg-background/80 px-4 py-2 backdrop-blur md:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger className="inline-flex items-center gap-2 text-sm font-medium">
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
        </div>

        <div className="mx-auto w-full max-w-3xl px-6 py-10">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
