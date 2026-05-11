import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * DOM id of the title portal target.
 *
 * Used by `<Title>` to locate the destination element via `createPortal`.
 * Kept stable for backward compatibility with the previous `id="breadcrumb"`
 * slot in the default Layout header — this constant is the canonical one used
 * by the new `<AppBar>` / `<Title>` pair.
 */
export const TITLE_PORTAL_ID = "ra-title-portal";

export type TitlePortalProps = HTMLAttributes<HTMLDivElement>;

/**
 * Render target for `<Title>`, placed in the app bar.
 *
 * `<TitlePortal>` reserves the DOM slot where page titles (and breadcrumbs)
 * are teleported. The default Layout includes it inside `<AppBar>`, but it
 * can also be used directly when composing a custom header.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/titleportal/ TitlePortal documentation}
 *
 * @example
 * import { TitlePortal, Title } from "@/components/admin";
 *
 * const CustomHeader = () => (
 *   <header className="flex items-center px-4 h-12">
 *     <TitlePortal />
 *   </header>
 * );
 */
export const TitlePortal = ({ className, ...rest }: TitlePortalProps) => (
  <div
    id={TITLE_PORTAL_ID}
    className={cn("flex items-center min-w-0", className)}
    {...rest}
  />
);
