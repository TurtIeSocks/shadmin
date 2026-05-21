import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import { Basic, showDataProvider, showTransport } from "@/stories/realtime/show-live.stories";

describe("<ShowLive>", () => {
  it("renders the record field", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("alpha").first()).toBeVisible();
  });

  it("refreshes when an event arrives for the record", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("alpha").first()).toBeVisible();
    await showDataProvider.update("posts", { id: 1, data: { id: 1, title: "beta" }, previousData: { id: 1, title: "alpha" } });
    await showTransport.publish("resource/posts/1", { type: "updated", payload: { ids: [1] } });
    await expect.element(screen.getByText("beta").first()).toBeVisible();
  });
});
