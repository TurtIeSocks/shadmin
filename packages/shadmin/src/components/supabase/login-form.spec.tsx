import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { CoreAdminContext, type AuthProvider } from "shadmin-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "@/components/admin";
import { raSupabaseEnglishMessages } from "@/components/supabase/i18n/en";

const { loginMock } = vi.hoisted(() => ({ loginMock: vi.fn() }));

vi.mock("ra-core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ra-core")>();
  return { ...actual, useLogin: () => loginMock };
});

import { SupabaseLoginForm } from "@/components/supabase/login-form";

const i18nProvider = polyglotI18nProvider(
  () => ({ ...defaultMessages, ...raSupabaseEnglishMessages }),
  "en",
  undefined,
  { allowMissing: true },
);

const stubAuth = (): AuthProvider => ({
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
  checkError: async () => {},
  getPermissions: async () => null,
});

const renderForm = (ui: React.ReactElement) =>
  render(
    <MemoryRouter>
      <ThemeProvider>
        <CoreAdminContext authProvider={stubAuth()} i18nProvider={i18nProvider}>
          {ui}
        </CoreAdminContext>
      </ThemeProvider>
    </MemoryRouter>,
  );

describe("<SupabaseLoginForm />", () => {
  it("renders email and password fields and a forgot-password link", async () => {
    const screen = renderForm(<SupabaseLoginForm />);
    await expect.element(screen.getByLabelText(/Email/)).toBeInTheDocument();
    await expect.element(screen.getByLabelText(/Password/)).toBeInTheDocument();
    await expect
      .element(screen.getByRole("link", { name: /Forgot password\?/ }))
      .toBeInTheDocument();
  });

  it("calls useLogin with the submitted credentials", async () => {
    loginMock.mockClear();
    loginMock.mockResolvedValue(undefined);
    const screen = renderForm(<SupabaseLoginForm />);
    await screen.getByLabelText(/Email/).fill("janedoe@example.com");
    await screen.getByLabelText(/Password/).fill("hunter2");
    await screen.getByRole("button", { name: /Sign in/ }).click();
    expect(loginMock).toHaveBeenCalledWith(
      { email: "janedoe@example.com", password: "hunter2" },
      undefined,
    );
  });

  it("hides the forgot-password link when disableForgotPassword is set", async () => {
    const screen = renderForm(<SupabaseLoginForm disableForgotPassword />);
    await expect
      .element(screen.getByRole("link", { name: /Forgot password\?/ }))
      .not.toBeInTheDocument();
  });
});
