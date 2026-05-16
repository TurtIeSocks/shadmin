import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { WithEvents } from "@/stories/leaflet-geoman.stories";

describe("<GeomanEvents />", () => {
  it("renders without crashing inside a MapContainer", async () => {
    const screen = render(<WithEvents />);
    await expect.element(screen.getByTestId("geoman-wrap")).toBeInTheDocument();
  });

  it("starts with a create count of 0", async () => {
    const screen = render(<WithEvents />);
    const count = await screen.getByTestId("create-count");
    expect(count.element().textContent).toBe("0");
  });
});
