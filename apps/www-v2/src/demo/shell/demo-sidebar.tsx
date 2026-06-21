import { useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "shadmin/components/ui/sidebar";
import { NavTree } from "@/components/site-shell/nav-tree";
import { SECTION_META } from "@/docs/section-meta";
import { coverageReport } from "../gallery/coverage";
import {
  componentDocSlugs,
  exampleSlugs,
  galleryNav,
} from "../gallery/examples-nav";
import { demoResources } from "../app/resources";
import { FEATURES } from "../features/features-nav";

/** Missing slugs set — used for coverage dot rendering. */
const { missing: missingSlugs } = coverageReport(
  componentDocSlugs,
  exampleSlugs,
);
const missingSet = new Set(missingSlugs);

/**
 * Returns an `isActive(to, exact?)` predicate bound to the current pathname.
 * Exact matches the Dashboard link (`/demo/app`); prefix matches a resource
 * and its sub-pages (`/demo/app/orders`, `/demo/app/orders/3`, …).
 */
function useIsActive() {
  const { pathname: current } = useLocation();
  return (to: string, exact = false) =>
    exact ? current === to : current === to || current.startsWith(`${to}/`);
}

/** Slug segment after /demo/components/ (or "") */
function useActiveComponentSlug() {
  const { pathname } = useLocation();
  const match = pathname.match(/^\/demo\/components\/(.+)$/);
  return match?.[1] ?? "";
}

/** Small muted dot shown on gallery leaves not yet covered by an example. */
function UncoveredDot() {
  return (
    <span
      title="not yet covered"
      className="ml-auto inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40"
    />
  );
}

/**
 * The demo's 3-zone sidebar content — designed to be passed as children of
 * `<SiteSidebar>` (which provides the surrounding `<Sidebar>` shell).
 *
 * Zones:
 * - **App** — Dashboard link + the six demo resources from `demoResources`.
 * - **Components** — gallery tree (5 categories) with coverage dot indicators.
 * - **Features** — placeholder (filled in Phase 3).
 */
export function DemoSidebarContent() {
  const isActive = useIsActive();
  const activeSlug = useActiveComponentSlug();

  // Open-state for the gallery NavTree (mirror docs-layout pattern).
  const [openDirs, setOpenDirs] = useState<Set<string>>(
    () => new Set<string>(),
  );

  function onToggle(dir: string, open: boolean) {
    setOpenDirs((prev) => {
      const next = new Set(prev);
      if (open) next.add(dir);
      else next.delete(dir);
      return next;
    });
  }

  return (
    <>
      {/* --- App zone ------------------------------------------------- */}
      <SidebarGroup className="py-0.5">
        <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wide">
          App
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/demo/app", true)}>
                <Link to="/demo/app">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {Object.entries(demoResources).map(([name, resource]) => {
              const to = `/demo/app/${name}`;
              return (
                <SidebarMenuItem key={name}>
                  <SidebarMenuButton asChild isActive={isActive(to)}>
                    <Link to={to}>
                      {resource.icon}
                      <span>{resource.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* --- Components zone ------------------------------------------ */}
      <SidebarGroup className="py-0.5">
        <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wide">
          Components
        </SidebarGroupLabel>
        <NavTree
          tree={galleryNav}
          hrefFor={(s) => `/demo/components/${s}`}
          iconFor={(dir) => SECTION_META[dir]?.icon}
          activeSlug={activeSlug}
          openDirs={openDirs}
          onToggle={onToggle}
          badgeFor={(slug) => (missingSet.has(slug) ? <UncoveredDot /> : null)}
          sectionAsToggle
        />
      </SidebarGroup>

      {/* --- Features zone ------------------------------------------- */}
      <SidebarGroup className="py-0.5">
        <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wide">
          Features
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {FEATURES.map((feature) => {
              const to = `/demo/features/${feature.slug}`;
              const Icon = feature.icon;
              return (
                <SidebarMenuItem key={feature.slug}>
                  <SidebarMenuButton asChild isActive={isActive(to)}>
                    <Link to={to}>
                      <Icon />
                      <span>{feature.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}
