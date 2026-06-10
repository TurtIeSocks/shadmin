import type { ErrorInfo } from "react";
import { Suspense, useState } from "react";
import { cn } from "shadcn-admin-kit/lib/utils";
import type { CoreLayoutProps } from "ra-core";
import { ErrorBoundary } from "react-error-boundary";
import { SidebarProvider, SidebarTrigger } from "shadcn-admin-kit/components/ui/sidebar";
import { UserMenu } from "shadcn-admin-kit/components/admin/user-menu";
import { ThemeModeToggle } from "shadcn-admin-kit/components/admin/theme-mode-toggle";
import { Notification } from "shadcn-admin-kit/components/admin/notification";
import { DemoSidebar } from "./DemoSidebar";
import { RefreshButton } from "shadcn-admin-kit/components/admin/refresh-button";
import { LocalesMenuButton } from "shadcn-admin-kit/components/admin/locales-menu-button";
import { Error } from "shadcn-admin-kit/components/admin/error";
import { Loading } from "shadcn-admin-kit/components/admin/loading";
import { InspectorButton } from "shadcn-admin-kit/components/admin/inspector-button";
import { Inspector } from "shadcn-admin-kit/components/admin/inspector";
import { CommandMenu } from "shadcn-admin-kit/components/extras/command-menu";
import { DataProviderDevtools } from "shadcn-admin-kit/components/extras/data-provider-devtools";
import { LayoutBuilderButton, ThemeStudioButton } from "./admin-tools-drawer";
import { I18nKeyEditorButton } from "./i18n-tools-menu";

/**
 * Demo layout that exposes the Inspector / Configurable system.
 *
 * Mirrors the default <Layout> but mounts the Inspector edit-mode UI so users
 * can toggle which DataTable columns / form fields are visible at runtime.
 *
 * The <InspectorButton /> sits between <LocalesMenuButton /> and
 * <ThemeModeToggle /> in the header — grouped with the other "global toggle"
 * buttons (option 2a from the Phase 2 follow-up design).
 *
 * The <Inspector /> floating panel mounts as a sibling of <main> after
 * <Notification />, so both `position: fixed` overlays sit above the layout
 * flow without affecting it.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/inspector/ Inspector documentation}
 */
export const InspectorLayout = (props: CoreLayoutProps) => {
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | undefined>(undefined);
  const handleError = (_: unknown, info: ErrorInfo) => {
    setErrorInfo(info);
  };
  return (
    <DataProviderDevtools defaultOpen={false} keyboardShortcut="ctrl+shift+d">
      <SidebarProvider>
        <DemoSidebar />
        <main
          className={cn(
            "ml-auto w-full max-w-full",
            "peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]",
            "peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]",
            "sm:transition-[width] sm:duration-200 sm:ease-linear",
            "flex h-svh flex-col",
            "group-data-[scroll-locked=1]/body:h-full",
            "has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh",
          )}
        >
          <header className="flex h-16 md:h-12 shrink-0 items-center gap-2 px-4">
            <SidebarTrigger className="scale-125 sm:scale-100" />
            <div className="flex-1 flex items-center" id="breadcrumb" />
            <LocalesMenuButton />
            <I18nKeyEditorButton />
            <InspectorButton />
            <ThemeStudioButton />
            <LayoutBuilderButton />
            <ThemeModeToggle />
            <RefreshButton />
            <UserMenu />
          </header>
          <ErrorBoundary
            onError={handleError}
            fallbackRender={({ error, resetErrorBoundary }) => (
              <Error
                error={error}
                errorInfo={errorInfo}
                resetErrorBoundary={resetErrorBoundary}
              />
            )}
          >
            <Suspense fallback={<Loading />}>
              <div className="flex flex-1 flex-col px-4 ">{props.children}</div>
            </Suspense>
          </ErrorBoundary>
        </main>
        <Notification />
        <Inspector />
        <CommandMenu />
      </SidebarProvider>
    </DataProviderDevtools>
  );
};
