import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  EmptyValue,
} from "@/stories/leaflet/multi-point-field.stories";

const findAsync = async (
  container: Element,
  selector: string,
): Promise<Element | null> => {
  let el: Element | null = null;
  for (let i = 0; i < 50 && !el; i++) {
    el = container.querySelector(selector);
    if (!el) await new Promise((r) => setTimeout(r, 50));
  }
  return el;
};

describe("<MultiPointField />", () => {
  it("renders multiple markers from a MultiPoint geometry", async () => {
    const screen = render(<Basic />);
    expect(screen.container.querySelector(".leaflet-container")).not.toBeNull();
    const marker = await findAsync(screen.container, ".leaflet-marker-pane > *");
    expect(marker).not.toBeNull();
  });

  it("renders the empty-state panel when there is no geometry", async () => {
    const screen = render(<EmptyValue />);
    await expect
      .element(screen.getByText(/no geometry available/i))
      .toBeInTheDocument();
  });
});
