import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  CustomText,
} from "@/components/admin/auth/access-denied.stories";

describe("<AccessDenied />", () => {
  it("renders the default access-denied message", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByText(/access denied/i))
      .toBeInTheDocument();
  });

  it("renders custom primary text", async () => {
    const screen = render(<CustomText />);
    await expect.element(screen.getByText("Not allowed")).toBeInTheDocument();
  });
});
