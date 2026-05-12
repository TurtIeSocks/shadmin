import type { ReactNode } from "react";
import { useTranslate } from "ra-core";
import { AuthLayout } from "@/components/admin/auth-layout";
import { ForgotPasswordForm } from "./forgot-password-form";

export interface ForgotPasswordPageProps {
  children?: ReactNode;
  /**
   * Optional content for `<AuthLayout>`'s left pane. Pass any ReactNode
   * to opt into a two-column split-screen; omit for centered single-column.
   */
  aside?: ReactNode;
}

/**
 * Standalone page rendering the password-reset form inside the kit's
 * shared `<AuthLayout>`. Register at `ForgotPasswordPage.path` via
 * `<CustomRoutes noLayout>` in your Admin.
 *
 * @example
 * import { CustomRoutes } from 'ra-core';
 * import { Route } from 'react-router';
 *
 * <Admin>
 *   <CustomRoutes noLayout>
 *     <Route
 *       path={ForgotPasswordPage.path}
 *       element={<ForgotPasswordPage />}
 *     />
 *   </CustomRoutes>
 * </Admin>
 */
export const ForgotPasswordPage = ({
  children = <ForgotPasswordForm />,
  aside,
}: ForgotPasswordPageProps) => {
  const translate = useTranslate();
  return (
    <AuthLayout
      title={translate("ra-supabase.reset_password.forgot_password", {
        _: "Forgot password?",
      })}
      subtitle={translate("ra-supabase.reset_password.forgot_password_details", {
        _: "Enter your email for instructions.",
      })}
      aside={aside}
    >
      {children}
    </AuthLayout>
  );
};

ForgotPasswordPage.path = "/forgot-password";
