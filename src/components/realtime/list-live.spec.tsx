import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import { Basic, basicDataProvider, basicTransport } from "@/stories/realtime/list-live.stories";

describe("<ListLive>", () => {
  it("renders rows", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("alpha")).toBeVisible();
  });

  it("refreshes when an event arrives", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("alpha")).toBeVisible();
    await basicDataProvider.create("posts", { data: { id: 2, title: "beta" } });
    await basicTransport.publish("resource/posts", { type: "created", payload: { ids: [2] } });
    await expect.element(screen.getByText("beta")).toBeVisible();
  });
});
