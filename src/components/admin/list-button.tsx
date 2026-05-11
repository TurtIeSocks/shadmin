import * as React from "react";
import { buttonVariants } from "@/components/ui/button";
import { List as ListIcon } from "lucide-react";
import {
  useCanAccess,
  useCreatePath,
  useGetResourceLabel,
  useResourceContext,
  useResourceTranslation,
} from "ra-core";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

export type ListButtonProps = {
  resource?: string;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
  scrollToTop?: boolean;
};

/**
 * Opens the List view of a given resource.
 *
 * Reads the resource from `ResourceContext` by default. Commonly used in the actions of an
 * `<Edit>` or `<Show>` view to navigate back to the list.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/listbutton/ ListButton documentation}
 *
 * @example
 * import { Edit, ListButton } from '@/components/admin';
 *
 * const PostEdit = () => (
 *   <Edit actions={<ListButton />}>
 *     ...
 *   </Edit>
 * );
 */
export const ListButton = (props: ListButtonProps) => {
  const {
    label: labelProp,
    icon = defaultIcon,
    className,
    scrollToTop = true,
  } = props;
  const resource = useResourceContext(props);
  if (!resource) {
    throw new Error(
      "<ListButton> components should be used inside a <Resource> component or provided the resource prop.",
    );
  }
  const { canAccess, isPending } = useCanAccess({
    action: "list",
    resource,
  });
  const createPath = useCreatePath();
  const getResourceLabel = useGetResourceLabel();
  const label = useResourceTranslation({
    resourceI18nKey: `resources.${resource}.action.list`,
    baseI18nKey: "ra.action.list",
    options: {
      name: getResourceLabel(resource, 2),
    },
    userText: labelProp,
  });

  if (!canAccess || isPending) {
    return null;
  }

  return (
    <Link
      className={cn(buttonVariants({ variant: "outline" }), className)}
      to={createPath({ type: "list", resource })}
      state={scrollToTop ? scrollState : undefined}
      aria-label={typeof label === "string" ? label : undefined}
    >
      {icon}
      {label}
    </Link>
  );
};

const defaultIcon = <ListIcon />;
const scrollState = { _scrollToTop: true };
