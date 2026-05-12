import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import {
  Default,
  NoForgotPassword,
  SocialOnly,
  WithSocialProviders,
} from "@/stories/supabase/login-page.stories";

describe("<SupabaseLoginPage />", () => {
  it("renders email/password form by default", async () => {
    const screen = render(<Default />);
    await expect.element(screen.getByLabelText(/Email/)).toBeInTheDocument();
    await expect.element(screen.getByLabelText(/Password/)).toBeInTheDocument();
    await expect
      .element(screen.getByRole("link", { name: /Forgot password\?/ }))
      .toBeInTheDocument();
  });

  it("renders social provider buttons when providers are given", async () => {
    const screen = render(<WithSocialProviders />);
    await expect
      .element(screen.getByRole("button", { name: /Sign in with Github/ }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /Sign in with Google/ }))
      .toBeInTheDocument();
  });

  it("hides the email/password form when disableEmailPassword is set", async () => {
    const screen = render(<SocialOnly />);
    await expect
      .element(screen.getByLabelText(/Email/))
      .not.toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /Sign in with Github/ }))
      .toBeInTheDocument();
  });

  it("omits the forgot-password link when disableForgotPassword is set", async () => {
    const screen = render(<NoForgotPassword />);
    await expect
      .element(screen.getByRole("link", { name: /Forgot password\?/ }))
      .not.toBeInTheDocument();
  });
});
