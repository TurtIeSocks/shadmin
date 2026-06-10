import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, Failed, Pending } from "./webhook-endpoint-field.stories";

describe("<WebhookEndpointField />", () => {
  it("renders the URL and an OK status badge for a successful last delivery", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByText("https://example.com/webhook"))
      .toBeInTheDocument();
    const badge = screen.container.querySelector(
      "[data-webhook-status]",
    ) as HTMLElement;
    expect(badge.getAttribute("data-status")).toBe("ok");
  });

  it("flags failed status when lastDelivery.status is 'failed'", async () => {
    const screen = render(<Failed />);
    const badge = screen.container.querySelector(
      "[data-webhook-status]",
    ) as HTMLElement;
    expect(badge.getAttribute("data-status")).toBe("failed");
  });

  it("falls back to pending when lastDelivery is undefined", async () => {
    const screen = render(<Pending />);
    const badge = screen.container.querySelector(
      "[data-webhook-status]",
    ) as HTMLElement;
    expect(badge.getAttribute("data-status")).toBe("pending");
  });

  it("never renders the secret", async () => {
    const screen = render(<Basic />);
    expect(screen.container.textContent ?? "").not.toContain("whsec_abc");
  });
});
