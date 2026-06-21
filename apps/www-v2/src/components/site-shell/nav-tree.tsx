import { ChevronRight } from "lucide-react";
import { NavLink } from "react-router";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "shadmin/components/ui/collapsible";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "shadmin/components/ui/sidebar";
import type { DocGroup, DocNode } from "@/docs/types";

export interface NavTreeProps {
  tree: DocGroup[];
  hrefFor: (slug: string) => string;
  activeSlug?: string;
  openDirs: Set<string>;
  onToggle: (dir: string, open: boolean) => void;
  onNavigate?: () => void;
}

interface NavInternalProps {
  activeSlug: string;
  hrefFor: (slug: string) => string;
  openDirs: Set<string>;
  onToggle: (dir: string, open: boolean) => void;
  onNavigate?: () => void;
}

// A navigable sub-page link (used inside a SidebarMenuSub). Groups link to
// their Overview (indexSlug); leaves link to themselves.
function NavSubLink({
  node,
  activeSlug,
  hrefFor,
  onNavigate,
}: { node: DocNode } & Pick<
  NavInternalProps,
  "activeSlug" | "hrefFor" | "onNavigate"
>) {
  const to = node.kind === "leaf" ? node.slug : (node.indexSlug ?? node.dir);
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild isActive={to === activeSlug}>
        <NavLink to={hrefFor(to)} onClick={onNavigate}>
          {node.title}
        </NavLink>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}

// Renders a section's children as menu items inside ONE <SidebarMenu>.
// Leaves are plain items; split pages are collapsible items whose label
// navigates to their Overview and whose chevron action toggles the sub-list.
function NavItems({
  nodes,
  activeSlug,
  hrefFor,
  openDirs,
  onToggle,
  onNavigate,
}: { nodes: DocNode[] } & NavInternalProps) {
  return nodes.map((node) =>
    node.kind === "leaf" ? (
      <SidebarMenuItem key={node.slug}>
        <SidebarMenuButton
          asChild
          size="sm"
          isActive={node.slug === activeSlug}
        >
          <NavLink to={hrefFor(node.slug)} onClick={onNavigate}>
            {node.title}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ) : (
      <Collapsible
        key={node.dir}
        asChild
        open={openDirs.has(node.dir)}
        onOpenChange={(o) => onToggle(node.dir, o)}
        className="group/collapsible"
      >
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            size="sm"
            isActive={!!node.indexSlug && node.indexSlug === activeSlug}
          >
            <NavLink
              to={hrefFor(node.indexSlug ?? node.dir)}
              onClick={onNavigate}
            >
              {node.title}
            </NavLink>
          </SidebarMenuButton>
          <CollapsibleTrigger asChild>
            <SidebarMenuAction className="transition-transform group-data-[state=open]/collapsible:rotate-90">
              <ChevronRight />
              <span className="sr-only">Toggle {node.title}</span>
            </SidebarMenuAction>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {node.children.map((child) => (
                <NavSubLink
                  key={child.kind === "leaf" ? child.slug : child.dir}
                  node={child}
                  activeSlug={activeSlug}
                  hrefFor={hrefFor}
                  onNavigate={onNavigate}
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    ),
  );
}

/**
 * Shared collapsible nav tree renderer.
 *
 * Presentation-only: caller owns open state + href shape.
 *   - docs:    hrefFor={s => `/docs/${s}`}
 *   - gallery: hrefFor={s => `/demo/components/${s}`}
 */
export function NavTree({
  tree,
  hrefFor,
  activeSlug = "",
  openDirs,
  onToggle,
  onNavigate,
}: NavTreeProps) {
  return (
    <SidebarContent className="gap-0 px-2 py-4">
      {tree.map((section) => (
        <Collapsible
          key={section.dir}
          open={openDirs.has(section.dir)}
          onOpenChange={(o) => onToggle(section.dir, o)}
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
                  <NavItems
                    nodes={section.children}
                    activeSlug={activeSlug}
                    hrefFor={hrefFor}
                    openDirs={openDirs}
                    onToggle={onToggle}
                    onNavigate={onNavigate}
                  />
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      ))}
    </SidebarContent>
  );
}
