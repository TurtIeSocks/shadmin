import { Link } from "react-router";
import { Translate, useTranslate } from "ra-core";
import { CircleAlert, Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface AuthErrorProps {
  className?: string;
  title?: string;
  message?: string;
}

/**
 * Authentication error page displayed when authentication fails.
 *
 * Used as the default screen for the `authenticationError` slot of the
 * `<Admin>` component, and as the fallback rendered by `<AuthCallback>`
 * when an OAuth callback errors out.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/autherror/ AuthError documentation}
 *
 * @example
 * import { Admin } from "@/components/admin";
 * import { AuthError } from "@/components/admin/auth-error";
 *
 * const App = () => (
 *   <Admin authenticationError={AuthError} authProvider={authProvider}>
 *     ...
 *   </Admin>
 * );
 */
export const AuthError = (props: AuthErrorProps) => {
  const {
    className,
    title = "ra.page.error",
    message = "ra.message.auth_error",
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
      <h1 className="flex items-center text-3xl my-5 gap-3" role="alert">
        <CircleAlert className="w-2em h-2em" />
        <Translate i18nKey={title} />
      </h1>
      <p className="my-5">{translate(message, { _: message })}</p>
      <Button asChild>
        <Link to="/login">
          <Lock /> {translate("ra.auth.sign_in", { _: "Sign in" })}
        </Link>
      </Button>
    </div>
  );
};
