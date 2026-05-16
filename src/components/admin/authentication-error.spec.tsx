import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  CustomText,
} from "@/stories/admin/authentication-error.stories";

describe("<AuthenticationError />", () => {
  it("renders the default authentication-error heading", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByText(/authentication error/i))
      .toBeInTheDocument();
  });

  it("renders custom primary text", async () => {
    const screen = render(<CustomText />);
    await expect
      .element(screen.getByText("Session expired"))
      .toBeInTheDocument();
  });
});
