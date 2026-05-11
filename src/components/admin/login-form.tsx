import { useState } from "react";
import { Form, required, useLogin, useNotify, useTranslate } from "ra-core";
import type { SubmitHandler, FieldValues } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { notifyAuthError } from "@/lib/notify-auth-error";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/admin/text-input";

export interface LoginFormProps {
  /**
   * Path the user is redirected to after a successful sign in.
   * Defaults to ra-core's default redirect (`/`).
   */
  redirectTo?: string;
  /**
   * Extra class names applied to the `<Form>` element.
   */
  className?: string;
}

/**
 * Email + password login form used by `<LoginPage>` and composable inside
 * any custom auth layout.
 *
 * Calls `authProvider.login()` via the `useLogin()` hook and surfaces
 * authentication errors through `useNotify()`. Returns the form on its own
 * — consumers are expected to provide the surrounding card / layout.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/loginform/ LoginForm documentation}
 *
 * @example
 * import { AuthLayout } from "@/components/admin/auth-layout";
 * import { LoginForm } from "@/components/admin/login-form";
 *
 * const MyLoginPage = () => (
 *   <AuthLayout title="Sign in">
 *     <LoginForm />
 *   </AuthLayout>
 * );
 */
export const LoginForm = (props: LoginFormProps) => {
  const { redirectTo, className } = props;
  const [loading, setLoading] = useState(false);
  const login = useLogin();
  const notify = useNotify();
  const translate = useTranslate();

  const handleSubmit: SubmitHandler<FieldValues> = (values) => {
    setLoading(true);
    login(values, redirectTo)
      .then(() => {
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        notifyAuthError(notify, error);
      });
  };

  return (
    <Form className={cn("space-y-8", className)} onSubmit={handleSubmit}>
      <TextInput
        label="Email"
        source="email"
        type="email"
        autoComplete="email"
        autoFocus
        validate={required()}
      />
      <TextInput
        label="Password"
        source="password"
        type="password"
        autoComplete="current-password"
        validate={required()}
      />
      <Button type="submit" className="cursor-pointer" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : null}
        {translate("ra.auth.sign_in", { _: "Sign in" })}
      </Button>
    </Form>
  );
};
