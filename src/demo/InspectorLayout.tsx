import type { ErrorInfo } from "react";
import { Suspense, useState } from "react";
import { cn } from "@/lib/utils";
import type { CoreLayoutProps } from "ra-core";
import { ErrorBoundary } from "react-error-boundary";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserMenu } from "@/components/admin/user-menu";
import { ThemeModeToggle } from "@/components/admin/theme-mode-toggle";
import { Notification } from "@/components/admin/notification";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { RefreshButton } from "@/components/admin/refresh-button";
import { LocalesMenuButton } from "@/components/admin/locales-menu-button";
import { Error } from "@/components/admin/error";
import { Loading } from "@/components/admin/loading";
// Phase 2 follow-up #2: wire <InspectorButton /> + <Inspector /> below.
// Uncomment when you fill in the TODO placements.
// import { InspectorButton } from "@/components/admin/inspector-button";
// import { Inspector } from "@/components/admin/inspector";

/**
 * Demo layout that exposes the Inspector / Configurable system.
 *
 * Mirrors the default <Layout> but reserves space for the Inspector edit-mode
 * UI so users can toggle which DataTable columns / form fields are visible at
 * runtime. Wire-in steps marked with TODO below.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/inspector/ Inspector documentation}
 */
export const InspectorLayout = (props: CoreLayoutProps) => {
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | undefined>(undefined);
  const handleError = (_: unknown, info: ErrorInfo) => {
    setErrorInfo(info);
  };
  return (
    <SidebarProvider>
      <AppSidebar />
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
          {/*
            TODO (Learning Mode #2a): place <InspectorButton /> in the header.

            Where does it belong? Options:
              (a) Right here, between LocalesMenuButton and ThemeModeToggle —
                  groups it with the other "global toggle" buttons.
              (b) Right before UserMenu — keeps it visually distinct as a
                  power-user / admin action.
              (c) Inside UserMenu as a dropdown item — hides it from casual
                  users until they explicitly opt into "Configure mode".

            Pick (a), (b), or (c). Replace the comment with <InspectorButton />.
          */}
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
      {/*
        TODO (Learning Mode #2b): mount <Inspector /> here as a sibling of
        <main>, so its position: fixed floats above the content without
        affecting layout flow. Replace this comment with <Inspector />.
      */}
    </SidebarProvider>
  );
};
