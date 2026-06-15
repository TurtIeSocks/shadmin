import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import { Basic } from "./menu-live.stories";
import { menuTransport } from "@/components/realtime/__fixtures__/menu-live-fixtures";

describe("<MenuLiveItemLink>", () => {
  it("does not show a badge initially", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("Posts")).toBeVisible();
    // Badge should not exist when count is 0
    expect(
      screen.container.querySelector('[data-testid="menu-live-badge"]'),
    ).toBeNull();
  });

  it("shows the badge after a created event on the resource topic", async () => {
    const screen = render(<Basic />);
    await menuTransport.publish("resource/posts", {
      type: "created",
      payload: { ids: [1] },
    });
    await expect
      .element(screen.getByTestId("menu-live-badge"))
      .toHaveTextContent("1");
  });
});
