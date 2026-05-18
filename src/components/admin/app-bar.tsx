import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SidebarToggleButton } from "@/components/admin/sidebar-toggle-button";
import { TitlePortal } from "@/components/admin/title-portal";
import { LocalesMenuButton } from "@/components/admin/locales-menu-button";
import { ThemeModeToggle } from "@/components/admin/theme-mode-toggle";
import { RefreshButton } from "@/components/admin/refresh-button";
import { UserMenu } from "@/components/admin/user-menu";

export type AppBarProps = HTMLAttributes<HTMLElement> & {
  /**
   * When provided, replaces the entire default AppBar layout. The default is:
   * sidebar trigger, breadcrumb portal (with title portal inside), locales menu,
   * theme toggle, refresh button, user menu.
   */
  children?: ReactNode;
  /**
   * Replaces the default right-side action cluster (LocalesMenuButton +
   * ThemeModeToggle + RefreshButton). Pass a ReactNode to supply custom
   * actions, or omit to keep the default cluster.
   */
  toolbar?: ReactNode;
  /**
   * Replaces the default `<UserMenu />`. Pass `false` to suppress it entirely,
   * or a ReactNode to render a custom user menu.
   */
  userMenu?: ReactNode | false;
};

/**
 * The header at the top of the admin layout.
 *
 * Renders the default app bar with sidebar trigger, breadcrumb/title slot,
 * and toolbar buttons (locales, theme, refresh, user menu). Pass children to
 * fully replace the layout — useful when composing a custom header.
 *
 * Visually identical to the previous inline `<header>` in `<Layout>`; this
 * component simply extracts the markup for reuse in custom layouts.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/appbar/ AppBar documentation}
 *
 * @example
 * import { AppBar, TitlePortal } from "@/components/admin";
 *
 * const MyAppBar = () => (
 *   <AppBar>
 *     <TitlePortal />
 *     <MyCustomButton />
 *   </AppBar>
 * );
 */
export const AppBar = ({
  children,
  className,
  toolbar,
  userMenu,
  ...rest
}: AppBarProps) => (
  <header
    className={cn(
      "flex h-16 md:h-12 shrink-0 items-center gap-2 px-4",
      className,
    )}
    {...rest}
  >
    {children ?? (
      <>
        <SidebarToggleButton />
        <div className="flex-1 flex items-center" id="breadcrumb">
          <TitlePortal />
        </div>
        {toolbar !== undefined ? (
          toolbar
        ) : (
          <>
            <LocalesMenuButton />
            <ThemeModeToggle />
            <RefreshButton />
          </>
        )}
        {userMenu !== false && (userMenu ?? <UserMenu />)}
      </>
    )}
  </header>
);
