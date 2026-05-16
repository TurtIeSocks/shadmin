import { Component, type ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { useWatch } from "react-hook-form";

import { SimplifyInput } from "@/components/leaflet";
import { StoryAdmin } from "@/stories/_test-helpers";
import { SimplifyInputBasic } from "@/stories/leaflet-shapes.stories";

interface ErrBoundaryState {
  err: Error | null;
}

class ErrBoundary extends Component<{ children: ReactNode }, ErrBoundaryState> {
  state: ErrBoundaryState = { err: null };
  static getDerivedStateFromError(err: Error): ErrBoundaryState {
    return { err };
  }
  render() {
    if (this.state.err) {
      return <pre data-testid="err-message">{this.state.err.message}</pre>;
    }
    return this.props.children;
  }
}

const ValueProbe = ({ source }: { source: string }) => {
  const value = useWatch({ name: source }) as GeoJSON.Polygon | null;
  const vertexCount =
    value?.type === "Polygon"
      ? value.coordinates[0]?.length ?? 0
      : 0;
  return (
    <pre data-testid="vertex-count">{String(vertexCount)}</pre>
  );
};

const ringWithN = (n: number): GeoJSON.Polygon => {
  const cx = 2.35;
  const cy = 48.85;
  const r = 0.02;
  const ring: GeoJSON.Position[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 2 * Math.PI;
    const jitter = 0.001 * (i % 2 === 0 ? 1 : -1);
    ring.push([cx + (r + jitter) * Math.cos(a), cy + (r + jitter) * Math.sin(a)]);
  }
  ring.push(ring[0]);
  return { type: "Polygon", coordinates: [ring] };
};

describe("<SimplifyInput />", () => {
  it("renders the label, slider, and quality toggle", async () => {
    const screen = render(<SimplifyInputBasic />);
    await expect.element(screen.getByText("Simplify")).toBeInTheDocument();
    await expect
      .element(screen.getByTestId("simplify-tolerance-slider"))
      .toBeInTheDocument();
    await expect
      .element(screen.getByTestId("simplify-quality-toggle"))
      .toBeInTheDocument();
  });

  it("throws when source value is non-null and not GeoJSON", async () => {
    // Suppress React's expected error log noise during this test.
    const orig = console.error;
    console.error = () => undefined;
    try {
      // ErrBoundary must be INSIDE StoryAdmin (which mounts a router) so it
      // catches the throw before react-router's own default error boundary.
      const screen = render(
        <StoryAdmin mode="form" record={{ area: 42 as unknown }}>
          <ErrBoundary>
            <SimplifyInput source="area" defaultCenter={[48.85, 2.35]} />
          </ErrBoundary>
        </StoryAdmin>,
      );
      const errEl = await screen.getByTestId("err-message");
      expect(errEl.element().textContent).toMatch(
        /SimplifyInput: source must be GeoJSON or null/,
      );
    } finally {
      console.error = orig;
    }
  });

  it("preserves the original vertex count when tolerance starts at 0", async () => {
    const original = ringWithN(20);
    const screen = render(
      <StoryAdmin mode="form" record={{ area: original }}>
        <SimplifyInput
          source="area"
          tolerance={0}
          maxTolerance={0.05}
          defaultCenter={[48.85, 2.35]}
        />
        <ValueProbe source="area" />
      </StoryAdmin>,
    );
    // tolerance=0 is a no-op for Douglas-Peucker — count should match
    // the original ring (which has 20 unique vertices + the closing duplicate
    // = 21 entries in coordinates[0]).
    const probe = await screen.getByTestId("vertex-count");
    await expect.poll(() => probe.element().textContent).toBe("21");
  });

  it("drops vertex count when tolerance is high", async () => {
    const original = ringWithN(20);
    const screen = render(
      <StoryAdmin mode="form" record={{ area: original }}>
        <SimplifyInput
          source="area"
          tolerance={0.05}
          maxTolerance={0.1}
          defaultCenter={[48.85, 2.35]}
        />
        <ValueProbe source="area" />
      </StoryAdmin>,
    );
    const probe = await screen.getByTestId("vertex-count");
    await expect
      .poll(() => Number(probe.element().textContent ?? "21"))
      .toBeLessThan(21);
  });
});
