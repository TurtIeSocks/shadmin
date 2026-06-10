import type { HTMLAttributes, ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { useDefaultTitle } from "ra-core";

import { Title } from "@/components/admin/title";
import { AccessDenied } from "./access-denied";

interface AuthenticationErrorProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  icon?: ReactNode;
  textPrimary?: string;
  textSecondary?: string;
}

/**
 * Full-page error screen displayed when authentication fails (for example
 * because of an expired session). Mirrors {@link AccessDenied} but uses a
 * warning triangle icon and different default texts.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/authenticationerror/ AuthenticationError documentation}
 */
function AuthenticationError({
  icon = <TriangleAlert className="size-32" />,
  textPrimary = "ra.page.authentication_error",
  textSecondary = "ra.message.authentication_error",
  ...rest
}: AuthenticationErrorProps) {
  const title = useDefaultTitle();
  return (
    <>
      <Title defaultTitle={title} />
      <AccessDenied
        icon={icon}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        {...rest}
      />
    </>
  );
}

export { AuthenticationError, type AuthenticationErrorProps };
