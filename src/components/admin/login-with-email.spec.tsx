import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/admin/login-with-email.stories";

describe("<LoginWithEmail />", () => {
  it("renders the email field and the custom submit button label", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByLabelText(/email/i)).toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /send magic link/i }))
      .toBeInTheDocument();
  });
});
