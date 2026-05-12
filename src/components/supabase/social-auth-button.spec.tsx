import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import type { AuthProvider } from "ra-core";
import { CoreAdminContext } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "@/components/admin";
import {
  GithubButton,
  SocialAuthButton,
} from "@/components/supabase/social-auth-button";
import { raSupabaseEnglishMessages } from "@/components/supabase/i18n/en";

// vi.mock is hoisted to the top of the file by vitest, so any variables it
// closes over must also be hoisted. vi.hoisted() ensures loginMock is
// initialised before the mock factory runs.
const { loginMock } = vi.hoisted(() => ({ loginMock: vi.fn() }));

vi.mock("ra-core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ra-core")>();
  return {
    ...actual,
    useLogin: () => loginMock,
  };
});

const i18nProvider = polyglotI18nProvider(
  () => ({ ...defaultMessages, ...raSupabaseEnglishMessages }),
  "en",
  undefined,
  { allowMissing: true },
);

const renderWithAuth = (ui: React.ReactElement, authProvider: AuthProvider) =>
  render(
    <MemoryRouter>
      <ThemeProvider>
        <CoreAdminContext
          authProvider={authProvider}
          i18nProvider={i18nProvider}
        >
          {ui}
        </CoreAdminContext>
      </ThemeProvider>
    </MemoryRouter>,
  );

const makeAuth = (): AuthProvider => ({
  login: vi.fn().mockResolvedValue(undefined),
  logout: async () => {},
  checkAuth: async () => {},
  checkError: async () => {},
  getPermissions: async () => null,
});

describe("<SocialAuthButton />", () => {
  it("renders the GithubButton with the translated label", async () => {
    loginMock.mockClear();
    loginMock.mockResolvedValue(undefined);
    const screen = renderWithAuth(<GithubButton />, makeAuth());
    await expect
      .element(screen.getByRole("button", { name: /Sign in with Github/ }))
      .toBeInTheDocument();
  });

  it("calls login with the provider name on click", async () => {
    loginMock.mockClear();
    loginMock.mockResolvedValue(undefined);
    const screen = renderWithAuth(<GithubButton />, makeAuth());
    await screen.getByRole("button", { name: /Sign in with Github/ }).click();
    // useLogin's returned function is called with (params, redirectTo).
    // The second arg is the current window location when no redirect prop is given.
    expect(loginMock).toHaveBeenCalledWith(
      { provider: "github" },
      expect.any(String),
    );
  });

  it("passes a custom redirect through to login", async () => {
    loginMock.mockClear();
    loginMock.mockResolvedValue(undefined);
    const screen = renderWithAuth(
      <SocialAuthButton provider="apple" redirect="/dashboard">
        Sign in with Apple
      </SocialAuthButton>,
      makeAuth(),
    );
    await screen.getByRole("button", { name: "Sign in with Apple" }).click();
    // The redirect prop must be forwarded as the second argument to the
    // function returned by useLogin — this is what ra-core uses for
    // post-login navigation.
    expect(loginMock).toHaveBeenCalledWith({ provider: "apple" }, "/dashboard");
  });
});
