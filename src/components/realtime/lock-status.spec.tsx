import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import { Held } from "@/stories/realtime/lock-status.stories";

describe("<LockStatus>", () => {
  it("renders the holder identity when locked", async () => {
    const screen = render(<Held />);
    await expect.element(screen.getByText(/Locked by alice/i)).toBeVisible();
  });
});
