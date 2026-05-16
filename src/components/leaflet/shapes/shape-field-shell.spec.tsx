import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { ShapeFieldShell } from "@/components/leaflet/shapes/shape-field-shell";
import { StoryAdmin } from "@/stories/_test-helpers";

const point = { type: "Point", coordinates: [2.35, 48.85] } satisfies GeoJSON.Geometry;

describe("<ShapeFieldShell />", () => {
  it("renders empty state when value missing", async () => {
    const screen = render(
      <StoryAdmin record={{ geom: null }}>
        <ShapeFieldShell source="geom" testId="x" />
      </StoryAdmin>,
    );
    await expect.element(screen.getByText(/no geometry/i)).toBeInTheDocument();
  });

  it("renders the map when value present", async () => {
    const screen = render(
      <StoryAdmin record={{ geom: point }}>
        <ShapeFieldShell source="geom" testId="x" />
      </StoryAdmin>,
    );
    await expect.element(screen.getByTestId("x")).toBeInTheDocument();
  });
});
