import * as React from "react";
import { useLocation, Link } from "react-router";
import { ChevronsUpDown, Home, BookOpen, LayoutDashboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "shadmin/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "shadmin/components/ui/sidebar";

interface Section {
  label: string;
  href: string;
  icon: React.ElementType;
}

const SECTIONS: Section[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Docs", href: "/docs", icon: BookOpen },
  { label: "Demo", href: "/demo", icon: LayoutDashboard },
];

function getActiveSection(pathname: string): Section {
  if (pathname.startsWith("/docs")) return SECTIONS[1];
  if (pathname.startsWith("/demo")) return SECTIONS[2];
  return SECTIONS[0];
}

export function SectionSwitcher() {
  const { pathname } = useLocation();
  const { isMobile } = useSidebar();
  const [open, setOpen] = React.useState(false);

  const active = getActiveSection(pathname);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-brand-gradient flex aspect-square size-8 items-center justify-center rounded-lg text-white">
                <active.icon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  shad<span className="text-brand-gradient">min</span>
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {active.label}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = section.href === active.href;
              return (
                <DropdownMenuItem key={section.href} asChild>
                  <Link
                    to={section.href}
                    className="flex items-center gap-2"
                    data-active={isActive || undefined}
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm border">
                      <Icon className="size-4 shrink-0" />
                    </div>
                    <span className={isActive ? "font-medium" : undefined}>
                      {section.label}
                    </span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
