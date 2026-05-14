import { useState } from "react";
import { Form, required, useLogin, useNotify, useTranslate } from "ra-core";
import type { SubmitHandler, FieldValues } from "react-hook-form";
import { Loader2, Mail } from "lucide-react";

import { cn } from "@/lib/utils";
import { notifyAuthError } from "@/lib/notify-auth-error";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/admin/text-input";

export interface LoginWithEmailProps {
  /**
   * Custom submit handler. When provided, it is called with the form values
   * (`{ email }`) and is responsible for signing the user in. Useful for
   * magic-link or passwordless flows where the standard `useLogin()` flow
   * needs to be bypassed.
   */
  onSubmit?: (values: { email: string }) => Promise<void> | void;
  /**
   * Forces the submit button into the loading state. When `onSubmit` is not
   * provided, the component manages its own loading state internally.
   */
  loading?: boolean;
  /**
   * Path the user is redirected to after a successful sign in. Only used
   * when `onSubmit` is omitted (default `useLogin()` flow).
   */
  redirectTo?: string;
  /**
   * Label of the submit button. Defaults to the i18n key `ra.auth.sign_in`.
   */
  submitLabel?: string;
  /**
   * Extra class names applied to the `<Form>` element.
   */
  className?: string;
}

/**
 * Email-only login form, suitable for magic-link / passwordless flows.
 *
 * Mirrors `<LoginForm>` but renders a single `email` field — no password.
 * By default, submitting the form calls `useLogin()` with `{ email }`.
 * Providing the `onSubmit` prop overrides this behavior so consumers can
 * trigger their own passwordless flow (e.g. send a magic link via the
 * `authProvider`).
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/loginwithemail/ LoginWithEmail documentation}
 *
 * @example
 * import { AuthLayout } from "@/components/admin/auth-layout";
 * import { LoginWithEmail } from "@/components/admin/login-with-email";
 *
 * const MagicLinkPage = () => (
 *   <AuthLayout
 *     title="Sign in"
 *     subtitle="Enter your email to receive a magic link"
 *   >
 *     <LoginWithEmail
 *       onSubmit={async ({ email }) => {
 *         await authProvider.sendMagicLink({ email });
 *       }}
 *       submitLabel="Send magic link"
 *     />
 *   </AuthLayout>
 * );
 */
export const LoginWithEmail = (props: LoginWithEmailProps) => {
  const {
    onSubmit,
    loading: loadingProp,
    redirectTo,
    submitLabel,
    className,
  } = props;
  const [internalLoading, setInternalLoading] = useState(false);
  const login = useLogin();
  const notify = useNotify();
  const translate = useTranslate();
  const loading = loadingProp ?? internalLoading;

  const handleSubmit: SubmitHandler<FieldValues> = async (values) => {
    const formValues = values as { email: string };
    if (onSubmit) {
      try {
        await onSubmit(formValues);
      } catch (error) {
        notifyAuthError(notify, error);
      }
      return;
    }

    setInternalLoading(true);
    login({ email: formValues.email }, redirectTo)
      .then(() => {
        setInternalLoading(false);
      })
      .catch((error) => {
        setInternalLoading(false);
        notifyAuthError(notify, error);
      });
  };

  return (
    <Form className={cn("space-y-8", className)} onSubmit={handleSubmit}>
      <TextInput
        label={translate("ra.auth.email", { _: "Email" })}
        source="email"
        type="email"
        autoComplete="email"
        validate={required()}
      />
      <Button type="submit" className="cursor-pointer" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : <Mail />}
        {submitLabel ?? translate("ra.auth.sign_in", { _: "Sign in" })}
      </Button>
    </Form>
  );
};
