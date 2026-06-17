import { Form, required, useNotify, useTranslate } from "shadmin-core";
import type { SubmitHandler, FieldValues } from "react-hook-form";
import { Link } from "react-router";
import { useResetPassword } from "ra-supabase-core";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/admin/inputs/text-input";

/**
 * Form that triggers a Supabase password-reset email.
 *
 * Calls `useResetPassword().mutateAsync({ email })` on submit and
 * surfaces errors via `useNotify`. Includes a "Back to login" link.
 */
function ForgotPasswordForm() {
  const notify = useNotify();
  const translate = useTranslate();
  const [, { mutateAsync: resetPassword }] = useResetPassword();

  const handleSubmit: SubmitHandler<FieldValues> = async (values) => {
    try {
      await resetPassword({ email: values.email });
    } catch (error) {
      notify(
        typeof error === "string"
          ? error
          : typeof error === "undefined" ||
              !(error as { message?: string }).message
            ? "ra.auth.sign_in_error"
            : (error as Error).message,
        {
          type: "warning",
          messageArgs: {
            _:
              typeof error === "string"
                ? error
                : error && (error as Error).message
                  ? (error as Error).message
                  : undefined,
          },
        },
      );
    }
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
        <Button type="submit" className="w-full cursor-pointer">
          {translate("ra.action.reset_password", {
            _: "Reset password",
          })}
        </Button>
      </Form>
      <div className="text-center">
        <Link
          to="/login"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          {translate("ra-supabase.auth.back_to_login", {
            _: "Back to login",
          })}
        </Link>
      </div>
    </>
  );
}

export { ForgotPasswordForm };
