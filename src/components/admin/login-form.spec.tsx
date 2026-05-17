import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/admin/login-form.stories";

describe("<LoginForm />", () => {
  it("renders the email and password fields with a sign-in button", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByLabelText(/email/i)).toBeInTheDocument();
    await expect
      .element(screen.getByLabelText(/password/i))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /sign in/i }))
      .toBeInTheDocument();
  });
});
