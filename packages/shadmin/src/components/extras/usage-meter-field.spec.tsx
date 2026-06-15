import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Critical,
  CustomThresholds,
  NoLimit,
  Warning,
} from "./usage-meter-field.stories";

describe("<UsageMeterField />", () => {
  it("renders a progress bar with used/limit text in default state", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("45 / 100 GB")).toBeInTheDocument();
    const bar = screen.container.querySelector(
      "[data-usage-meter]",
    ) as HTMLElement;
    expect(bar.getAttribute("data-state")).toBe("ok");
  });

  it("flags warning state at >=80% by default", async () => {
    const screen = render(<Warning />);
    const bar = screen.container.querySelector(
      "[data-usage-meter]",
    ) as HTMLElement;
    expect(bar.getAttribute("data-state")).toBe("warning");
  });

  it("flags critical state at >=100% by default", async () => {
    const screen = render(<Critical />);
    const bar = screen.container.querySelector(
      "[data-usage-meter]",
    ) as HTMLElement;
    expect(bar.getAttribute("data-state")).toBe("critical");
  });

  it("respects custom thresholds", async () => {
    const screen = render(<CustomThresholds />);
    // 60% with warning=50%, critical=75% → warning state
    const bar = screen.container.querySelector(
      "[data-usage-meter]",
    ) as HTMLElement;
    expect(bar.getAttribute("data-state")).toBe("warning");
  });

  it("renders bare value when limitSource is omitted", async () => {
    const screen = render(<NoLimit />);
    await expect.element(screen.getByText("45 requests")).toBeInTheDocument();
    expect(screen.container.querySelector("[data-usage-meter]")).toBeNull();
  });
});
