import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { PointInputBasic } from "@/stories/leaflet-shapes.stories";

describe("<PointInput />", () => {
  it("renders the labeled map input", async () => {
    const screen = render(<PointInputBasic />);
    await expect.element(screen.getByText("Pick a point")).toBeInTheDocument();
    await expect.element(screen.getByTestId("point-input")).toBeInTheDocument();
  });
});
