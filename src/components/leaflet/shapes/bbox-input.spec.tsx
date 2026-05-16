import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { useFormContext } from "react-hook-form";

import { BBoxInput } from "@/components/leaflet";
import { StoryAdmin } from "@/stories/_test-helpers";

const ValueProbe = () => {
  const form = useFormContext();
  const value = form.watch("bb");
  return <pre data-testid="bb-value">{JSON.stringify(value ?? null)}</pre>;
};

describe("<BBoxInput />", () => {
  it("renders the input shell with the bbox testid", async () => {
    const screen = render(
      <StoryAdmin mode="form" record={{ bb: null }}>
        <BBoxInput source="bb" label="Area" defaultCenter={[48.85, 2.35]} />
      </StoryAdmin>,
    );
    await expect.element(screen.getByText("Area")).toBeInTheDocument();
    await expect.element(screen.getByTestId("polygon-input")).toBeInTheDocument();
  });

  it("hydrates an existing bbox value and keeps it stored as [w,s,e,n]", async () => {
    const bb: GeoJSON.BBox = [2.34, 48.85, 2.36, 48.87];
    const screen = render(
      <StoryAdmin mode="form" record={{ bb }}>
        <BBoxInput source="bb" defaultCenter={[48.86, 2.35]} />
        <ValueProbe />
      </StoryAdmin>,
    );
    const probe = await screen.getByTestId("bb-value");
    // After hydration the form value remains the bbox array — write-back
    // only happens on draw/edit, not on hydration. The shape stored is the
    // 4-element tuple, not a Polygon object.
    expect(probe.element().textContent).toBe("[2.34,48.85,2.36,48.87]");
  });
});
