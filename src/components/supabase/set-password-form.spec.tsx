import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { CoreAdminContext, type AuthProvider } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "@/components/admin";
import { raSupabaseEnglishMessages } from "@/components/supabase/i18n/en";

// Mutable token-state container so the "missing tokens" test can override
// the per-test return values of useSupabaseAccessToken.
const { mutateAsync, tokenValues } = vi.hoisted(() => ({
  mutateAsync: vi.fn().mockResolvedValue(undefined),
  tokenValues: {
    access_token: "ACCESS" as string | undefined,
    refresh_token: "REFRESH" as string | undefined,
  },
}));

vi.mock("ra-supabase-core", () => ({
  useSetPassword: () => [{} as never, { mutateAsync }],
  useSupabaseAccessToken: ({ parameterName }: { parameterName?: string } = {}) =>
    tokenValues[
      (parameterName ?? "access_token") as "access_token" | "refresh_token"
    ],
}));

import { SetPasswordForm } from "@/components/supabase/set-password-form";

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
          <SetPasswordForm />
        </CoreAdminContext>
      </ThemeProvider>
    </MemoryRouter>,
  );

describe("<SetPasswordForm />", () => {
  it("renders password and confirm fields and the submit button", async () => {
    // Restore tokens for tests that need the form to render
    tokenValues.access_token = "ACCESS";
    tokenValues.refresh_token = "REFRESH";
    const screen = renderForm();
    await expect
      .element(screen.getByLabelText("Password *", { exact: true }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByLabelText("Confirm password *", { exact: true }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /Save/ }))
      .toBeInTheDocument();
  });

  it("shows a mismatch error when passwords differ", async () => {
    tokenValues.access_token = "ACCESS";
    tokenValues.refresh_token = "REFRESH";
    const screen = renderForm();
    await screen.getByLabelText("Password *", { exact: true }).fill("hunter2");
    await screen.getByLabelText("Confirm password *", { exact: true }).fill("hunter3");
    await screen.getByRole("button", { name: /Save/ }).click();
    const errors = screen.getByText("Passwords do not match").elements();
    expect(errors).toHaveLength(2);
  });

  it("calls useSetPassword.mutateAsync when passwords match", async () => {
    tokenValues.access_token = "ACCESS";
    tokenValues.refresh_token = "REFRESH";
    mutateAsync.mockClear();
    const screen = renderForm();
    await screen.getByLabelText("Password *", { exact: true }).fill("hunter2");
    await screen.getByLabelText("Confirm password *", { exact: true }).fill("hunter2");
    await screen.getByRole("button", { name: /Save/ }).click();
    expect(mutateAsync).toHaveBeenCalledWith({
      access_token: "ACCESS",
      refresh_token: "REFRESH",
      password: "hunter2",
    });
  });

  it("renders the missing-tokens message when tokens are absent", async () => {
    tokenValues.access_token = undefined;
    tokenValues.refresh_token = undefined;
    const screen = renderForm();
    await expect
      .element(screen.getByText(/Access and refresh tokens are missing/))
      .toBeInTheDocument();
    // restore for subsequent tests
    tokenValues.access_token = "ACCESS";
    tokenValues.refresh_token = "REFRESH";
  });
});
