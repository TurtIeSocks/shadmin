import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/components/admin/auth/login-with-email.stories";

describe("<LoginWithEmail />", () => {
  it("renders the email and password fields and the sign in button", async () => {
    const screen = render(<Basic />);
    const inputs = screen.container.querySelectorAll("input");
    expect(inputs.length).toBeGreaterThanOrEqual(2);
    const emailInput = screen.container.querySelector('input[type="email"]');
    const passwordInput = screen.container.querySelector(
      'input[type="password"]',
    );
    expect(emailInput).not.toBeNull();
    expect(passwordInput).not.toBeNull();
    await expect
      .element(screen.getByRole("button", { name: /sign in/i }))
      .toBeInTheDocument();
  });
});
