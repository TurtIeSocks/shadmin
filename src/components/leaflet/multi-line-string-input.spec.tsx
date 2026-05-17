import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/leaflet/multi-line-string-input.stories";

describe("<MultiLineStringInput />", () => {
  it("renders the labeled map input with a Leaflet container", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("Routes")).toBeInTheDocument();
    // `shape-input-shell` testId pattern for `MultiLineString` is `multilinestring-input`.
    const wrapper = await screen.getByTestId("multilinestring-input");
    await expect.element(wrapper).toBeInTheDocument();
    expect(
      wrapper.element().querySelector(".leaflet-container"),
    ).not.toBeNull();
  });
});
