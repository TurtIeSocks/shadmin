import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Disabled,
  RecommendedTier,
} from "./subscription-plan-picker.stories";

describe("<SubscriptionPlanPicker />", () => {
  it("renders a card per plan", async () => {
    const screen = render(<Basic />);
    const cards = screen.container.querySelectorAll("[data-plan-card]");
    expect(cards.length).toBe(3);
  });

  it("marks the current plan card as selected", async () => {
    const screen = render(<Basic />);
    const proCard = screen.container.querySelector(
      "[data-plan-card='pro']",
    ) as HTMLElement;
    expect(proCard.getAttribute("data-selected")).toBe("true");
  });

  it("flags the recommended plan when set", async () => {
    const screen = render(<RecommendedTier />);
    const proCard = screen.container.querySelector(
      "[data-plan-card='pro']",
    ) as HTMLElement;
    expect(proCard.getAttribute("data-recommended")).toBe("true");
  });

  it("disables all cards when disabled prop is set", async () => {
    const screen = render(<Disabled />);
    const buttons = screen.container.querySelectorAll(
      "[data-plan-card] button",
    );
    Array.from(buttons).forEach((b) =>
      expect((b as HTMLButtonElement).disabled).toBe(true),
    );
  });
});
