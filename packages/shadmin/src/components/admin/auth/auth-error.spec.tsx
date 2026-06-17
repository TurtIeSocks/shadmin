import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/components/admin/auth/auth-error.stories";

describe("<AuthError />", () => {
  it("renders the error heading", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders the sign-in link", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("link", { name: /sign in/i }))
      .toBeInTheDocument();
  });

  it("renders a custom message when one is provided", async () => {
    const screen = render(<Basic message="Custom auth error" />);
    await expect
      .element(screen.getByText("Custom auth error"))
      .toBeInTheDocument();
  });
});
