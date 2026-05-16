import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/admin/login-page.stories";

describe("<LoginPage />", () => {
  it("renders the auth layout with the embedded login form", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("heading", { name: "Sign in" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByLabelText(/email/i))
      .toBeInTheDocument();
    await expect
      .element(screen.getByLabelText(/password/i))
      .toBeInTheDocument();
  });
});
