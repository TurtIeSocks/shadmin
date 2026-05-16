import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Disabled,
  WithTestPing,
} from "@/stories/extras/webhook-endpoint-input.stories";

describe("<WebhookEndpointInput />", () => {
  it("renders URL + secret inputs bound to the composite", async () => {
    const screen = render(<Basic />);
    const url = screen.container.querySelector(
      "input[data-webhook-url]",
    ) as HTMLInputElement;
    const secret = screen.container.querySelector(
      "input[data-webhook-secret]",
    ) as HTMLInputElement;
    expect(url.value).toBe("https://example.com/webhook");
    expect(secret.value).toBe("whsec_abc123");
  });

  it("renders one checkbox per supported event type", async () => {
    const screen = render(<Basic />);
    const cbs = screen.container.querySelectorAll("[data-event-checkbox]");
    expect(cbs.length).toBe(5);
  });

  it("hides the test-ping button when no onTestPing is provided", async () => {
    const screen = render(<Basic />);
    expect(
      screen.container.querySelector("[data-test-ping-button]"),
    ).toBeNull();
  });

  it("shows the test-ping button when onTestPing is set", async () => {
    const screen = render(<WithTestPing />);
    const btn = screen.container.querySelector("[data-test-ping-button]");
    expect(btn).toBeTruthy();
  });

  it("respects disabled prop", async () => {
    const screen = render(<Disabled />);
    const url = screen.container.querySelector(
      "input[data-webhook-url]",
    ) as HTMLInputElement;
    expect(url.disabled).toBe(true);
  });
});
