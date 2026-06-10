/**
 * English translation messages for the Supabase integration.
 *
 * Merge into your i18n provider to translate the auth UI (login,
 * forgot/set password, social buttons) and Supabase-aware guessers.
 * All ra-supabase.* keys also have inline `_:` English fallbacks in
 * the components, so loading these messages is optional.
 *
 * Source: ra-supabase-language-english@3.5.2
 */
const raSupabaseEnglishMessages = {
  "ra-supabase": {
    auth: {
      email: "Email",
      confirm_password: "Confirm password",
      sign_in_with: "Sign in with %{provider}",
      forgot_password: "Forgot password?",
      reset_password: "Reset password",
      password_reset:
        "Your password has been reset. You will receive an email containing a link to log in.",
      missing_tokens: "Access and refresh tokens are missing",
      back_to_login: "Back to login",
    },
    reset_password: {
      forgot_password: "Forgot password?",
      forgot_password_details: "Enter your email for instructions.",
    },
    set_password: {
      new_password: "Choose your password",
    },
    validation: {
      password_mismatch: "Passwords do not match",
    },
  },
};

export { raSupabaseEnglishMessages };
