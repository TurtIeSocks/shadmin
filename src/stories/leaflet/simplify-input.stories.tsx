import { SimplifyInput } from "@/components/leaflet";
import { StoryAdmin } from "@/stories/_test-helpers";

export default { title: "Map (Leaflet)/SimplifyInput" };

// Build a 20-vertex roughly-circular polygon. Visible difference between
// tolerance=0 (original) and tolerance≈0.05 (heavily simplified).
const buildJaggedRing = (cx = 2.35, cy = 48.85, r = 0.02): GeoJSON.Polygon => {
  const N = 20;
  const ring: GeoJSON.Position[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * 2 * Math.PI;
    const jitter = 0.001 * (i % 2 === 0 ? 1 : -1);
    ring.push([cx + (r + jitter) * Math.cos(a), cy + (r + jitter) * Math.sin(a)]);
  }
  ring.push(ring[0]); // close
  return { type: "Polygon", coordinates: [ring] };
};

const jaggedPolygon = buildJaggedRing();

/** Slider-driven Douglas-Peucker simplification of a polygon. */
export const Basic = () => (
  <StoryAdmin mode="form" record={{ area: jaggedPolygon }}>
    <SimplifyInput
      source="area"
      label="Simplify"
      helperText="Adjust the slider to lower the vertex count."
      defaultCenter={[48.85, 2.35]}
    />
  </StoryAdmin>
);

/** Custom tolerance range exposes finer-grained control. */
export const FineGrainedTolerance = () => (
  <StoryAdmin mode="form" record={{ area: jaggedPolygon }}>
    <SimplifyInput
      source="area"
      label="Fine-grained simplify"
      minTolerance={0}
      maxTolerance={0.02}
      step={0.0005}
      tolerance={0.005}
      defaultCenter={[48.85, 2.35]}
    />
  </StoryAdmin>
);

/** Empty form — slider has no geometry to simplify yet. */
export const EmptyValue = () => (
  <StoryAdmin mode="form" record={{ area: null }}>
    <SimplifyInput
      source="area"
      label="Simplify (empty)"
      defaultCenter={[48.85, 2.35]}
    />
  </StoryAdmin>
);
