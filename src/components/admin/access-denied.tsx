import type { HTMLAttributes, ReactNode } from "react";
import { Lock } from "lucide-react";
import { useTranslate } from "ra-core";

import { cn } from "@/lib/utils";

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
 * Wraps `useTranslate()` to translate the heading and body text — pass
 * raw strings to display them as-is or i18n keys to translate them.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/accessdenied/ AccessDenied documentation}
 *
 * @example
 * import { AccessDenied } from "@/components/admin/access-denied";
 *
 * const Forbidden = () => <AccessDenied />;
 */
export const AccessDenied = (props: AccessDeniedProps) => {
  const {
    className,
    icon = <Lock className="w-32 h-32" />,
    textPrimary = "ra.page.access_denied",
    textSecondary = "ra.message.access_denied",
    ...rest
  } = props;

  const translate = useTranslate();

  return (
    <div
      className={cn(
        "flex flex-col justify-center items-center h-full",
        className,
      )}
      {...rest}
    >
      <div className="text-center pt-4 pb-4 opacity-50">
        {icon}
        <h5 className="text-secondary-foreground text-2xl mt-3">
          {translate(textPrimary, { _: textPrimary })}
        </h5>
        <p className="text-sm">
          {translate(textSecondary, { _: textSecondary })}
        </p>
      </div>
    </div>
  );
};
