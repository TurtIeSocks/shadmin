import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  CustomLimit,
  Hidden,
} from "./data-provider-devtools.stories";

describe("<DataProviderDevtools />", () => {
  it("renders the floating panel by default with logged calls", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByText(/data provider/i))
      .toBeInTheDocument();
    // Both calls should appear once the effect fires
    await expect.element(screen.getByText(/getList/i)).toBeInTheDocument();
    await expect.element(screen.getByText(/getOne/i)).toBeInTheDocument();
  });

  it("renders children regardless of panel state", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByText("Triggered 2 calls"))
      .toBeInTheDocument();
  });

  it("hides the panel when defaultOpen=false", async () => {
    const screen = render(<Hidden />);
    const panel = screen.container.querySelector("[data-devtools-panel]");
    expect(panel?.getAttribute("data-open")).toBe("false");
  });

  it("respects the maxLogs prop on data attribute", async () => {
    const screen = render(<CustomLimit />);
    const panel = screen.container.querySelector("[data-devtools-panel]");
    expect(panel?.getAttribute("data-max-logs")).toBe("10");
  });
});
