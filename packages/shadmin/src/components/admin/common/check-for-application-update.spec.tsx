import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/components/admin/common/check-for-application-update.stories";

describe("<CheckForApplicationUpdate />", () => {
  it("renders the inlined update notification provided by the story", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByText(/a new version is available/i))
      .toBeInTheDocument();
  });
});
