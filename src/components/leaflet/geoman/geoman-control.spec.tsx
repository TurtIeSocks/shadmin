import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, PolygonOnly } from "@/stories/leaflet-geoman.stories";

describe("<GeomanControl />", () => {
  it("attaches Geoman toolbar to the map", async () => {
    const screen = render(<Basic />);
    const wrap = await screen.getByTestId("geoman-wrap");
    await expect.element(wrap).toBeInTheDocument();
    const toolbar = screen.container.querySelector(".leaflet-pm-toolbar");
    expect(toolbar).not.toBeNull();
  });

  it("hides draw buttons not in the shapes list", async () => {
    const screen = render(<PolygonOnly />);
    const wrap = await screen.getByTestId("geoman-wrap");
    await expect.element(wrap).toBeInTheDocument();
    const polyBtn = screen.container.querySelector("[title*='polygon' i]");
    const lineBtn = screen.container.querySelector("[title*='line' i]");
    expect(polyBtn).not.toBeNull();
    expect(lineBtn).toBeNull();
  });
});
