import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { useFormContext } from "react-hook-form";

import { FeatureInput } from "@/components/leaflet";
import { StoryAdmin } from "@/stories/_test-helpers";
import { FeatureFieldBasic, FeatureInputBasic } from "@/stories/leaflet/leaflet-shapes.stories";

const findAsync = async (
  container: HTMLElement,
  selector: string,
): Promise<Element | null> => {
  let el: Element | null = null;
  for (let i = 0; i < 50 && !el; i++) {
    el = container.querySelector(selector);
    if (!el) await new Promise((r) => setTimeout(r, 50));
  }
  return el;
};

const ValueProbe = ({ source }: { source: string }) => {
  const form = useFormContext();
  const value = form.watch(source);
  return <pre data-testid="feat-value">{JSON.stringify(value ?? null)}</pre>;
};

describe("<FeatureField />", () => {
  it("renders the GeoJSON layer when value is a Feature", async () => {
    const screen = render(<FeatureFieldBasic />);
    const path = await findAsync(screen.container, "path.leaflet-interactive");
    expect(path).not.toBeNull();
  });
});

describe("<FeatureInput />", () => {
  it("mounts inside a form (shell test-id present)", async () => {
    const screen = render(<FeatureInputBasic />);
    await expect.element(screen.getByTestId("polygon-input")).toBeInTheDocument();
  });

  it("hydrates a Feature value and keeps it stored as a Feature", async () => {
    const seed: GeoJSON.Feature = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.34, 48.85],
            [2.36, 48.85],
            [2.36, 48.87],
            [2.34, 48.87],
            [2.34, 48.85],
          ],
        ],
      },
      properties: { name: "test", id: 7 },
    };
    const screen = render(
      <StoryAdmin mode="form" record={{ geom: seed }}>
        <FeatureInput source="geom" defaultCenter={[48.85, 2.35]} />
        <ValueProbe source="geom" />
      </StoryAdmin>,
    );
    const probe = await screen.getByTestId("feat-value");
    // Hydration alone shouldn't rewrite the form value — it should still be
    // the seeded Feature with its properties intact.
    expect(probe.element().textContent).toContain('"type":"Feature"');
    expect(probe.element().textContent).toContain('"name":"test"');
    expect(probe.element().textContent).toContain('"id":7');
  });
});
