import { useState } from "react";
import { Form, required, useLogin, useNotify, useTranslate } from "ra-core";
import type { SubmitHandler, FieldValues } from "react-hook-form";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/admin/text-input";

interface SupabaseLoginFormProps {
  disableForgotPassword?: boolean;
  redirectTo?: string;
}

/**
 * Email + password sign-in form for Supabase authentication.
 *
 * Calls `useLogin({ email, password }, redirectTo)` on submit and
 * renders a "Forgot password?" link below the form unless
 * `disableForgotPassword` is set. The link points at
 * `ForgotPasswordPage.path` (`/forgot-password`).
 */
const SupabaseLoginForm = ({
  disableForgotPassword,
  redirectTo,
}: SupabaseLoginFormProps) => {
  const [loading, setLoading] = useState(false);
  const login = useLogin();
  const notify = useNotify();
  const translate = useTranslate();

  const handleSubmit: SubmitHandler<FieldValues> = (values) => {
    setLoading(true);
    login(values, redirectTo)
      .then(() => setLoading(false))
      .catch((error) => {
        setLoading(false);
        notify(
          typeof error === "string"
            ? error
            : typeof error === "undefined" || !error.message
              ? "ra.auth.sign_in_error"
              : error.message,
          {
            type: "error",
            messageArgs: {
              _:
                typeof error === "string"
                  ? error
                  : error && error.message
                    ? error.message
                    : undefined,
            },
          },
        );
      });
  };

  return (
    <>
      <Form className="space-y-6" onSubmit={handleSubmit}>
        <TextInput
          label={translate("ra.auth.email", { _: "Email" })}
          source="email"
          type="email"
          autoComplete="email"
          validate={required()}
        />
        <TextInput
          label={translate("ra.auth.password", { _: "Password" })}
          source="password"
          type="password"
          autoComplete="current-password"
          validate={required()}
        />
        <Button
          type="submit"
          className="w-full cursor-pointer"
          disabled={loading}
        >
          {translate("ra.auth.sign_in", { _: "Sign in" })}
        </Button>
      </Form>
      {!disableForgotPassword && (
        <div className="text-center">
          <Link
            to="/forgot-password"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            {translate("ra-supabase.auth.forgot_password", {
              _: "Forgot password?",
            })}
          </Link>
        </div>
      )}
    </>
  );
};

export { type SupabaseLoginFormProps, SupabaseLoginForm };
