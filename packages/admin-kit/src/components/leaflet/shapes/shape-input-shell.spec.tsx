import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { ShapeInputShell } from "@/components/leaflet/shapes/shape-input-shell";
import { StoryAdmin } from "@/test/_test-helpers";

describe("<ShapeInputShell />", () => {
  it("renders inside a form with label + helper text", async () => {
    const screen = render(
      <StoryAdmin mode="form" record={{ geom: null }}>
        <ShapeInputShell
          source="geom"
          shape="Polygon"
          multi={false}
          label="Service area"
          helperText="Click points to draw"
          height={300}
        />
      </StoryAdmin>,
    );
    await expect.element(screen.getByText("Service area")).toBeInTheDocument();
    await expect
      .element(screen.getByText("Click points to draw"))
      .toBeInTheDocument();
  });
});
