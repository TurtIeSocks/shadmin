import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export interface SidebarToggleButtonProps {
  className?: string;
}

/**
 * A standalone button that opens or closes the main sidebar.
 *
 * Convenience wrapper around the shadcn/ui `<SidebarTrigger>` matching the
 * sizing applied by the default `<Layout>` header. Use it when composing
 * a custom layout that needs to expose the sidebar toggle outside the
 * default header slot.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/sidebartogglebutton/ SidebarToggleButton documentation}
 *
 * @example
 * import { SidebarToggleButton } from "@/components/admin";
 *
 * const CustomHeader = () => (
 *   <header>
 *     <SidebarToggleButton />
 *   </header>
 * );
 */
export const SidebarToggleButton = (props: SidebarToggleButtonProps) => {
  const { className } = props;
  return <SidebarTrigger className={cn("scale-125 sm:scale-100", className)} />;
};
