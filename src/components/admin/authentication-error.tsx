import type { HTMLAttributes, ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { useTranslate } from "ra-core";

import { cn } from "@/lib/utils";

export interface AuthenticationErrorProps
  extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  icon?: ReactNode;
  textPrimary?: string;
  textSecondary?: string;
}

/**
 * Full-page error screen displayed when authentication fails (for example
 * because of an expired session). Mirrors `<AccessDenied>` but uses a
 * warning triangle icon and different default texts.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/authenticationerror/ AuthenticationError documentation}
 *
 * @example
 * import { AuthenticationError } from "@/components/admin/authentication-error";
 *
 * const Unauthorized = () => <AuthenticationError />;
 */
export const AuthenticationError = (props: AuthenticationErrorProps) => {
  const {
    className,
    icon = <TriangleAlert className="w-32 h-32" />,
    textPrimary = "ra.page.authentication_error",
    textSecondary = "ra.message.authentication_error",
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
