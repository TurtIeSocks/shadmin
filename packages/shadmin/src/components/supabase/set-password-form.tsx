import { Form, required, useNotify, useTranslate } from "shadmin-core";
import type { SubmitHandler, FieldValues } from "react-hook-form";
import { useSetPassword, useSupabaseAccessToken } from "ra-supabase-core";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/admin/text-input";

interface FormData {
  password: string;
  confirmPassword: string;
}

/**
 * Form that finishes Supabase's password-reset / first-login flow.
 *
 * Reads `access_token` and `refresh_token` from the URL hash via
 * `useSupabaseAccessToken()` (populated by Supabase's redirect after
 * the user clicks the reset/invite email). Submits the new password
 * to `useSetPassword().mutateAsync()`.
 *
 * If either token is missing, renders the translated
 * `ra-supabase.auth.missing_tokens` message instead.
 */
function SetPasswordForm() {
  const access_token = useSupabaseAccessToken();
  const refresh_token = useSupabaseAccessToken({
    parameterName: "refresh_token",
  });
  const notify = useNotify();
  const translate = useTranslate();
  const [, { mutateAsync: setPassword }] = useSetPassword();

  if (!access_token || !refresh_token) {
    if (process.env.NODE_ENV === "development") {
      console.error("Missing access_token or refresh_token for set password");
    }
    return (
      <div className="text-center text-sm text-muted-foreground">
        {translate("ra-supabase.auth.missing_tokens", {
          _: "Access and refresh tokens are missing",
        })}
      </div>
    );
  }

  const validate = (values: FieldValues) => {
    if (values.password !== values.confirmPassword) {
      return {
        password: "ra-supabase.validation.password_mismatch",
        confirmPassword: "ra-supabase.validation.password_mismatch",
      };
    }
    return {};
  };

  const handleSubmit: SubmitHandler<FieldValues> = async (values) => {
    try {
      await setPassword({
        access_token,
        refresh_token,
        password: (values as FormData).password,
      });
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
    <Form className="space-y-6" onSubmit={handleSubmit} validate={validate}>
      <TextInput
        label={translate("ra.auth.password", { _: "Password" })}
        source="password"
        type="password"
        autoComplete="new-password"
        validate={required()}
      />
      <TextInput
        label={translate("ra.auth.confirm_password", {
          _: "Confirm password",
        })}
        source="confirmPassword"
        type="password"
        autoComplete="new-password"
        validate={required()}
      />
      <Button type="submit" className="w-full cursor-pointer">
        {translate("ra.action.save", { _: "Save" })}
      </Button>
    </Form>
  );
}

export { SetPasswordForm };
