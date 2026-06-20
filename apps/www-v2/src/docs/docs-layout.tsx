import { ChevronRight } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "shadmin/components/ui/collapsible";
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

export default function DocsLayout() {
  const { pathname } = useLocation();
  const activeSlug = pathname.replace(/^\/docs\/?/, "").replace(/\/+$/, "");

  return (
    <SidebarProvider className="min-h-0">
      <Sidebar
        collapsible="none"
        className="sticky top-14 h-[calc(100svh-3.5rem)] border-r bg-transparent"
      >
        <SidebarContent className="gap-0 px-2 py-4">
          {navTree.map((section) => {
            const leaves = section.children.filter(
              (c): c is DocLeaf => c.kind === "leaf",
            );
            const hasActive = leaves.some((l) => l.slug === activeSlug);
            return (
              <Collapsible
                key={section.dir}
                defaultOpen={hasActive || section.dir === "getting-started"}
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
                              <NavLink to={`/docs/${leaf.slug}`}>
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
      </Sidebar>

      <SidebarInset className="bg-transparent">
        <div className="mx-auto w-full max-w-3xl px-6 py-10">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
