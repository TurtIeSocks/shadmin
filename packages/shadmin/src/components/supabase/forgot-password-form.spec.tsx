import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { CoreAdminContext, type AuthProvider } from "shadmin-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "@/components/admin";
import { raSupabaseEnglishMessages } from "@/components/supabase/i18n/en";

// Mock the hook from ra-supabase-core. The actual hook returns a
// react-query mutation tuple; the form only uses the second element.
const { mutateAsync } = vi.hoisted(() => ({
  mutateAsync: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("ra-supabase-core", () => ({
  useResetPassword: () => [{} as never, { mutateAsync }],
}));

import { ForgotPasswordForm } from "@/components/supabase/forgot-password-form";

const i18nProvider = polyglotI18nProvider(
  () => ({ ...defaultMessages, ...raSupabaseEnglishMessages }),
  "en",
  undefined,
  { allowMissing: true },
);

const auth: AuthProvider = {
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
  checkError: async () => {},
  getPermissions: async () => null,
};

const renderForm = () =>
  render(
    <MemoryRouter>
      <ThemeProvider>
        <CoreAdminContext authProvider={auth} i18nProvider={i18nProvider}>
          <ForgotPasswordForm />
        </CoreAdminContext>
      </ThemeProvider>
    </MemoryRouter>,
  );

describe("<ForgotPasswordForm />", () => {
  it("renders the email field, submit button, and back-to-login link", async () => {
    const screen = renderForm();
    await expect.element(screen.getByLabelText(/Email/)).toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /Reset password/ }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("link", { name: /Back to login/ }))
      .toBeInTheDocument();
  });

  it("calls useResetPassword.mutateAsync with the email on submit", async () => {
    mutateAsync.mockClear();
    const screen = renderForm();
    await screen.getByLabelText(/Email/).fill("jane@example.com");
    await screen.getByRole("button", { name: /Reset password/ }).click();
    expect(mutateAsync).toHaveBeenCalledWith({ email: "jane@example.com" });
  });
});
