import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Free,
  Unknown,
} from "@/stories/extras/subscription-plan-field.stories";

describe("<SubscriptionPlanField />", () => {
  it("renders the matched plan's name and price", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("Pro")).toBeInTheDocument();
    await expect.element(screen.getByText(/\$29/)).toBeInTheDocument();
  });

  it("renders the Free plan label when matched", async () => {
    const screen = render(<Free />);
    await expect.element(screen.getByText("Free")).toBeInTheDocument();
  });

  it("renders empty fallback when planId doesn't match any plan", async () => {
    const screen = render(<Unknown />);
    await expect.element(screen.getByText("—")).toBeInTheDocument();
  });
});
