import type { ReactNode } from "react";
import { useTranslate } from "ra-core";
import { AuthLayout } from "@/components/admin/auth-layout";
import { SetPasswordForm } from "./set-password-form";

interface SetPasswordPageProps {
  children?: ReactNode;
  /**
   * Optional content for `<AuthLayout>`'s left pane. Pass any ReactNode
   * to opt into a two-column split-screen; omit for centered single-column.
   */
  aside?: ReactNode;
}

/**
 * Standalone page that finishes the Supabase password-set flow
 * (first-login after invite, password reset).
 *
 * Register at `SetPasswordPage.path` (`/set-password`) via
 * `<CustomRoutes noLayout>` so it is reachable without authentication.
 */
const SetPasswordPage = ({
  children = <SetPasswordForm />,
  aside,
}: SetPasswordPageProps) => {
  const translate = useTranslate();
  return (
    <AuthLayout
      title={translate("ra-supabase.set_password.new_password", {
        _: "Choose your password",
      })}
      aside={aside}
    >
      {children}
    </AuthLayout>
  );
};

SetPasswordPage.path = "/set-password";

export { type SetPasswordPageProps, SetPasswordPage };
