import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Loading, Idle } from "@/stories/admin/loading-indicator.stories";

describe("<LoadingIndicator />", () => {
  it("renders the loading status icon when fetches are pending", async () => {
    const screen = render(<Loading />);
    await expect.element(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders nothing when there is no pending fetch", async () => {
    const screen = render(<Idle />);
    // The idle wrapper keeps the surrounding text but does not render an icon.
    await expect.element(screen.getByText(/idle/i)).toBeInTheDocument();
    await expect.element(screen.getByRole("status")).not.toBeInTheDocument();
  });
});
