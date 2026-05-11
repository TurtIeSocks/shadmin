import type { HTMLAttributes, ReactNode } from "react";
import { Lock } from "lucide-react";

import { AuthErrorScreen } from "./auth-error-screen";

export interface AccessDeniedProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  icon?: ReactNode;
  textPrimary?: string;
  textSecondary?: string;
}

/**
 * Full-page error screen displayed when the current user does not have
 * permission to access a resource.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/accessdenied/ AccessDenied documentation}
 */
export const AccessDenied = ({
  icon = <Lock className="w-32 h-32" />,
  textPrimary = "ra.page.access_denied",
  textSecondary = "ra.message.access_denied",
  ...rest
}: AccessDeniedProps) => (
  <AuthErrorScreen
    icon={icon}
    textPrimary={textPrimary}
    textSecondary={textSecondary}
    {...rest}
  />
);
