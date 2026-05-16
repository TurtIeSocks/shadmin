/**
 * Seed data for the "places" demo resource — Points of Interest around NYC.
 *
 * Each record carries an intentionally rich shape so the demo views can
 * exercise every GeoJSON field/input the library ships:
 *   - lat/lng pair       → LatLngField / LatLngInput / MapWithSearch / ReverseGeocodeField
 *   - location:Point     → PointField / PointInput
 *   - alt_locations:MP   → MultiPointField / MultiPointInput
 *   - route:LineString   → LineStringField / LineStringInput
 *   - trails:MLS         → MultiLineStringField / MultiLineStringInput
 *   - area:Polygon       → PolygonField / PolygonInput / SimplifyInput / OsmFeature*
 *   - boundaries:MP      → MultiPolygonField / MultiPolygonInput
 *   - bbox:BBox          → BBoxField / BBoxInput
 *   - features:FC        → FeatureCollectionField / FeatureCollectionInput
 *   - geometries:GC      → GeometryCollectionField / GeometryCollectionInput
 *   - feature:Feature    → FeatureField / FeatureInput
 *   - geom:GeoJSON-any   → GeoJsonField / GeoJsonInput
 *
 * Coordinates are real NYC-area lon/lat in EPSG:4326 (GeoJSON order: [lng, lat]).
 */

export type PlaceType = "park" | "lake" | "trail" | "monument";

export interface Place {
  id: number;
  name: string;
  type: PlaceType;
  address: string;
  // single-coord pair (used by LatLngField / ReverseGeocodeField / MapWithSearch)
  lat: number;
  lng: number;
  // primitive geometries
  location: GeoJSON.Point;
  area: GeoJSON.Polygon | null;
  bbox: GeoJSON.BBox;
  // multi-geometries
  alt_locations: GeoJSON.MultiPoint | null;
  route: GeoJSON.LineString | null;
  trails: GeoJSON.MultiLineString | null;
  boundaries: GeoJSON.MultiPolygon | null;
  // composites
  feature: GeoJSON.Feature;
  features: GeoJSON.FeatureCollection;
  geometries: GeoJSON.GeometryCollection;
  // free-form (used by GeoJsonField / GeoJsonInput)
  geom: GeoJSON.Geometry;
}

// Central Park (Manhattan): roughly bounded rectangle around the park.
const centralPark: Place = {
  id: 1,
  name: "Central Park",
  type: "park",
  address: "New York, NY 10024, USA",
  lat: 40.7829,
  lng: -73.9654,
  location: { type: "Point", coordinates: [-73.9654, 40.7829] },
  area: {
    type: "Polygon",
    coordinates: [
      [
        [-73.9819, 40.7681],
        [-73.9495, 40.7969],
        [-73.9586, 40.8005],
        [-73.9911, 40.7716],
        [-73.9819, 40.7681],
      ],
    ],
  },
  bbox: [-73.9911, 40.7681, -73.9495, 40.8005],
  alt_locations: {
    type: "MultiPoint",
    coordinates: [
      [-73.9762, 40.7794], // Bethesda Terrace
      [-73.9665, 40.7812], // The Mall
      [-73.9583, 40.7837], // Bow Bridge
      [-73.9658, 40.7857], // Bethesda Fountain
    ],
  },
  route: {
    type: "LineString",
    coordinates: [
      [-73.9819, 40.7681],
      [-73.9772, 40.7732],
      [-73.9698, 40.7790],
      [-73.9586, 40.7895],
      [-73.9495, 40.7969],
    ],
  },
  trails: {
    type: "MultiLineString",
    coordinates: [
      [
        [-73.9762, 40.7700],
        [-73.9700, 40.7745],
        [-73.9650, 40.7810],
      ],
      [
        [-73.9820, 40.7800],
        [-73.9750, 40.7860],
        [-73.9580, 40.7960],
      ],
    ],
  },
  boundaries: {
    type: "MultiPolygon",
    coordinates: [
      [
        [
          [-73.9819, 40.7681],
          [-73.9700, 40.7700],
          [-73.9710, 40.7800],
          [-73.9819, 40.7780],
          [-73.9819, 40.7681],
        ],
      ],
      [
        [
          [-73.9650, 40.7820],
          [-73.9495, 40.7969],
          [-73.9586, 40.8005],
          [-73.9700, 40.7900],
          [-73.9650, 40.7820],
        ],
      ],
    ],
  },
  feature: {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-73.9819, 40.7681],
          [-73.9495, 40.7969],
          [-73.9586, 40.8005],
          [-73.9911, 40.7716],
          [-73.9819, 40.7681],
        ],
      ],
    },
    properties: { name: "Central Park boundary", landuse: "park" },
  },
  features: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-73.9665, 40.7812] },
        properties: { name: "The Mall", category: "promenade" },
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-73.9583, 40.7837] },
        properties: { name: "Bow Bridge", category: "landmark" },
      },
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [-73.9762, 40.7700],
            [-73.9650, 40.7820],
          ],
        },
        properties: { name: "Park drive (south)", category: "road" },
      },
    ],
  },
  geometries: {
    type: "GeometryCollection",
    geometries: [
      { type: "Point", coordinates: [-73.9654, 40.7829] },
      {
        type: "LineString",
        coordinates: [
          [-73.9762, 40.7700],
          [-73.9650, 40.7820],
        ],
      },
    ],
  },
  geom: { type: "Point", coordinates: [-73.9654, 40.7829] },
};

// Brooklyn Bridge — monument, modeled by a line crossing the East River.
const brooklynBridge: Place = {
  id: 2,
  name: "Brooklyn Bridge",
  type: "monument",
  address: "New York, NY 10038, USA",
  lat: 40.7061,
  lng: -73.9969,
  location: { type: "Point", coordinates: [-73.9969, 40.7061] },
  area: {
    type: "Polygon",
    coordinates: [
      [
        [-74.0011, 40.7032],
        [-73.9923, 40.7088],
        [-73.9921, 40.7095],
        [-74.0009, 40.7039],
        [-74.0011, 40.7032],
      ],
    ],
  },
  bbox: [-74.0011, 40.7032, -73.9921, 40.7095],
  alt_locations: {
    type: "MultiPoint",
    coordinates: [
      [-74.0011, 40.7032], // Manhattan anchorage
      [-73.9921, 40.7095], // Brooklyn anchorage
    ],
  },
  route: {
    type: "LineString",
    coordinates: [
      [-74.0011, 40.7032],
      [-73.9967, 40.7062],
      [-73.9921, 40.7095],
    ],
  },
  trails: {
    type: "MultiLineString",
    coordinates: [
      [
        [-74.0008, 40.7035],
        [-73.9965, 40.7065],
        [-73.9924, 40.7092],
      ],
      [
        [-74.0014, 40.7029],
        [-73.9969, 40.7059],
        [-73.9918, 40.7098],
      ],
    ],
  },
  boundaries: null,
  feature: {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [-74.0011, 40.7032],
        [-73.9921, 40.7095],
      ],
    },
    properties: { name: "Bridge centerline", opened: 1883 },
  },
  features: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-74.0011, 40.7032] },
        properties: { name: "Manhattan tower" },
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-73.9921, 40.7095] },
        properties: { name: "Brooklyn tower" },
      },
    ],
  },
  geometries: {
    type: "GeometryCollection",
    geometries: [
      { type: "Point", coordinates: [-73.9969, 40.7061] },
      {
        type: "LineString",
        coordinates: [
          [-74.0011, 40.7032],
          [-73.9921, 40.7095],
        ],
      },
    ],
  },
  geom: {
    type: "LineString",
    coordinates: [
      [-74.0011, 40.7032],
      [-73.9921, 40.7095],
    ],
  },
};

// The High Line — elevated linear park on Manhattan's west side.
const highLine: Place = {
  id: 3,
  name: "The High Line",
  type: "trail",
  address: "New York, NY 10011, USA",
  lat: 40.7480,
  lng: -74.0048,
  location: { type: "Point", coordinates: [-74.0048, 40.748] },
  area: {
    type: "Polygon",
    coordinates: [
      [
        [-74.009, 40.74],
        [-74.0035, 40.7405],
        [-74.0, 40.7555],
        [-74.0055, 40.756],
        [-74.009, 40.74],
      ],
    ],
  },
  bbox: [-74.009, 40.74, -74.0, 40.756],
  alt_locations: {
    type: "MultiPoint",
    coordinates: [
      [-74.0085, 40.7405],
      [-74.0048, 40.7480],
      [-74.0021, 40.7541],
    ],
  },
  route: {
    type: "LineString",
    coordinates: [
      [-74.0085, 40.7405],
      [-74.0066, 40.7444],
      [-74.0048, 40.7480],
      [-74.0021, 40.7541],
      [-74.0008, 40.7558],
    ],
  },
  trails: {
    type: "MultiLineString",
    coordinates: [
      [
        [-74.0085, 40.7405],
        [-74.0048, 40.748],
      ],
      [
        [-74.0048, 40.748],
        [-74.0008, 40.7558],
      ],
    ],
  },
  boundaries: null,
  feature: {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [-74.0085, 40.7405],
        [-74.0008, 40.7558],
      ],
    },
    properties: { name: "High Line path", length_m: 2330 },
  },
  features: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-74.0085, 40.7405] },
        properties: { name: "Gansevoort entrance" },
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-74.0008, 40.7558] },
        properties: { name: "34th Street terminus" },
      },
    ],
  },
  geometries: {
    type: "GeometryCollection",
    geometries: [
      { type: "Point", coordinates: [-74.0048, 40.748] },
      {
        type: "LineString",
        coordinates: [
          [-74.0085, 40.7405],
          [-74.0008, 40.7558],
        ],
      },
    ],
  },
  geom: {
    type: "LineString",
    coordinates: [
      [-74.0085, 40.7405],
      [-74.0008, 40.7558],
    ],
  },
};

// The Reservoir (Jacqueline Kennedy Onassis Reservoir) — lake inside Central Park.
const reservoir: Place = {
  id: 4,
  name: "Jacqueline Kennedy Onassis Reservoir",
  type: "lake",
  address: "New York, NY 10024, USA",
  lat: 40.7857,
  lng: -73.9658,
  location: { type: "Point", coordinates: [-73.9658, 40.7857] },
  area: {
    type: "Polygon",
    coordinates: [
      [
        [-73.971, 40.781],
        [-73.961, 40.781],
        [-73.961, 40.791],
        [-73.971, 40.791],
        [-73.971, 40.781],
      ],
    ],
  },
  bbox: [-73.971, 40.781, -73.961, 40.791],
  alt_locations: {
    type: "MultiPoint",
    coordinates: [
      [-73.9697, 40.7836], // south gatehouse
      [-73.9620, 40.7886], // north gatehouse
    ],
  },
  route: {
    type: "LineString",
    coordinates: [
      [-73.9697, 40.7836],
      [-73.967, 40.7820],
      [-73.962, 40.7830],
      [-73.961, 40.786],
      [-73.962, 40.789],
      [-73.967, 40.791],
      [-73.97, 40.790],
      [-73.971, 40.787],
      [-73.9697, 40.7836],
    ],
  },
  trails: {
    type: "MultiLineString",
    coordinates: [
      [
        [-73.9697, 40.7836],
        [-73.961, 40.786],
        [-73.967, 40.791],
        [-73.9697, 40.7836],
      ],
    ],
  },
  boundaries: {
    type: "MultiPolygon",
    coordinates: [
      [
        [
          [-73.971, 40.781],
          [-73.961, 40.781],
          [-73.961, 40.791],
          [-73.971, 40.791],
          [-73.971, 40.781],
        ],
      ],
    ],
  },
  feature: {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-73.971, 40.781],
          [-73.961, 40.781],
          [-73.961, 40.791],
          [-73.971, 40.791],
          [-73.971, 40.781],
        ],
      ],
    },
    properties: { name: "Reservoir basin", surface_area_acres: 106 },
  },
  features: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-73.9697, 40.7836] },
        properties: { name: "South gatehouse" },
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-73.962, 40.7886] },
        properties: { name: "North gatehouse" },
      },
    ],
  },
  geometries: {
    type: "GeometryCollection",
    geometries: [
      { type: "Point", coordinates: [-73.9658, 40.7857] },
      {
        type: "Polygon",
        coordinates: [
          [
            [-73.971, 40.781],
            [-73.961, 40.781],
            [-73.961, 40.791],
            [-73.971, 40.791],
            [-73.971, 40.781],
          ],
        ],
      },
    ],
  },
  geom: {
    type: "Polygon",
    coordinates: [
      [
        [-73.971, 40.781],
        [-73.961, 40.781],
        [-73.961, 40.791],
        [-73.971, 40.791],
        [-73.971, 40.781],
      ],
    ],
  },
};

// Coney Island — beach + boardwalk, Brooklyn south shore.
const coneyIsland: Place = {
  id: 5,
  name: "Coney Island Boardwalk",
  type: "park",
  address: "Brooklyn, NY 11224, USA",
  lat: 40.5733,
  lng: -73.9794,
  location: { type: "Point", coordinates: [-73.9794, 40.5733] },
  area: {
    type: "Polygon",
    coordinates: [
      [
        [-73.99, 40.572],
        [-73.965, 40.574],
        [-73.965, 40.577],
        [-73.99, 40.575],
        [-73.99, 40.572],
      ],
    ],
  },
  bbox: [-73.99, 40.572, -73.965, 40.577],
  alt_locations: {
    type: "MultiPoint",
    coordinates: [
      [-73.978, 40.5743], // Wonder Wheel
      [-73.9783, 40.5746], // Cyclone
      [-73.9821, 40.5733], // Aquarium
    ],
  },
  route: {
    type: "LineString",
    coordinates: [
      [-73.99, 40.5733],
      [-73.985, 40.5735],
      [-73.978, 40.5740],
      [-73.970, 40.5745],
      [-73.965, 40.5750],
    ],
  },
  trails: {
    type: "MultiLineString",
    coordinates: [
      [
        [-73.99, 40.5733],
        [-73.965, 40.5750],
      ],
      [
        [-73.985, 40.5738],
        [-73.975, 40.5742],
      ],
    ],
  },
  boundaries: null,
  feature: {
    type: "Feature",
    geometry: { type: "Point", coordinates: [-73.9794, 40.5733] },
    properties: { name: "Coney Island beach", access: "public" },
  },
  features: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-73.978, 40.5743] },
        properties: { name: "Deno's Wonder Wheel" },
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-73.9783, 40.5746] },
        properties: { name: "Cyclone roller coaster" },
      },
    ],
  },
  geometries: {
    type: "GeometryCollection",
    geometries: [
      { type: "Point", coordinates: [-73.9794, 40.5733] },
      {
        type: "LineString",
        coordinates: [
          [-73.99, 40.5733],
          [-73.965, 40.5750],
        ],
      },
    ],
  },
  geom: { type: "Point", coordinates: [-73.9794, 40.5733] },
};

// Statue of Liberty — monument on Liberty Island.
const statueOfLiberty: Place = {
  id: 6,
  name: "Statue of Liberty",
  type: "monument",
  address: "Liberty Island, New York, NY 10004, USA",
  lat: 40.6892,
  lng: -74.0445,
  location: { type: "Point", coordinates: [-74.0445, 40.6892] },
  area: {
    type: "Polygon",
    coordinates: [
      [
        [-74.0465, 40.688],
        [-74.0425, 40.688],
        [-74.0425, 40.6905],
        [-74.0465, 40.6905],
        [-74.0465, 40.688],
      ],
    ],
  },
  bbox: [-74.0465, 40.688, -74.0425, 40.6905],
  alt_locations: null,
  route: null,
  trails: null,
  boundaries: {
    type: "MultiPolygon",
    coordinates: [
      [
        [
          [-74.0465, 40.688],
          [-74.0425, 40.688],
          [-74.0425, 40.6905],
          [-74.0465, 40.6905],
          [-74.0465, 40.688],
        ],
      ],
    ],
  },
  feature: {
    type: "Feature",
    geometry: { type: "Point", coordinates: [-74.0445, 40.6892] },
    properties: { name: "Statue pedestal", height_m: 93 },
  },
  features: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-74.0445, 40.6892] },
        properties: { name: "Statue of Liberty" },
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-74.0395, 40.6996] },
        properties: { name: "Ellis Island" },
      },
    ],
  },
  geometries: {
    type: "GeometryCollection",
    geometries: [
      { type: "Point", coordinates: [-74.0445, 40.6892] },
    ],
  },
  geom: { type: "Point", coordinates: [-74.0445, 40.6892] },
};

// Prospect Park — Brooklyn's signature green space.
const prospectPark: Place = {
  id: 7,
  name: "Prospect Park",
  type: "park",
  address: "Brooklyn, NY 11225, USA",
  lat: 40.6602,
  lng: -73.9690,
  location: { type: "Point", coordinates: [-73.969, 40.6602] },
  area: {
    type: "Polygon",
    coordinates: [
      [
        [-73.98, 40.654],
        [-73.96, 40.652],
        [-73.957, 40.668],
        [-73.978, 40.671],
        [-73.98, 40.654],
      ],
    ],
  },
  bbox: [-73.98, 40.652, -73.957, 40.671],
  alt_locations: {
    type: "MultiPoint",
    coordinates: [
      [-73.9701, 40.6620], // The Bandshell
      [-73.9650, 40.6580], // Boathouse
      [-73.9719, 40.6700], // Long Meadow
    ],
  },
  route: {
    type: "LineString",
    coordinates: [
      [-73.98, 40.654],
      [-73.972, 40.662],
      [-73.967, 40.668],
      [-73.958, 40.665],
      [-73.96, 40.652],
      [-73.98, 40.654],
    ],
  },
  trails: {
    type: "MultiLineString",
    coordinates: [
      [
        [-73.978, 40.658],
        [-73.965, 40.665],
      ],
      [
        [-73.970, 40.654],
        [-73.962, 40.660],
        [-73.965, 40.668],
      ],
    ],
  },
  boundaries: {
    type: "MultiPolygon",
    coordinates: [
      [
        [
          [-73.98, 40.654],
          [-73.96, 40.652],
          [-73.957, 40.668],
          [-73.978, 40.671],
          [-73.98, 40.654],
        ],
      ],
    ],
  },
  feature: {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-73.98, 40.654],
          [-73.96, 40.652],
          [-73.957, 40.668],
          [-73.978, 40.671],
          [-73.98, 40.654],
        ],
      ],
    },
    properties: { name: "Park boundary", leisure: "park" },
  },
  features: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-73.9701, 40.662] },
        properties: { name: "Bandshell" },
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-73.965, 40.658] },
        properties: { name: "Boathouse" },
      },
    ],
  },
  geometries: {
    type: "GeometryCollection",
    geometries: [
      { type: "Point", coordinates: [-73.969, 40.6602] },
      {
        type: "Polygon",
        coordinates: [
          [
            [-73.98, 40.654],
            [-73.96, 40.652],
            [-73.957, 40.668],
            [-73.978, 40.671],
            [-73.98, 40.654],
          ],
        ],
      },
    ],
  },
  geom: {
    type: "Polygon",
    coordinates: [
      [
        [-73.98, 40.654],
        [-73.96, 40.652],
        [-73.957, 40.668],
        [-73.978, 40.671],
        [-73.98, 40.654],
      ],
    ],
  },
};

// Hudson River Greenway — long bike/foot trail along the Hudson.
const hudsonGreenway: Place = {
  id: 8,
  name: "Hudson River Greenway",
  type: "trail",
  address: "Manhattan Waterfront, New York, NY, USA",
  lat: 40.7589,
  lng: -74.0095,
  location: { type: "Point", coordinates: [-74.0095, 40.7589] },
  area: null,
  bbox: [-74.018, 40.700, -73.995, 40.870],
  alt_locations: {
    type: "MultiPoint",
    coordinates: [
      [-74.0163, 40.7042], // Battery Park
      [-74.0095, 40.7589], // Pier 84
      [-73.9988, 40.8200], // Riverside Park
    ],
  },
  route: {
    type: "LineString",
    coordinates: [
      [-74.0163, 40.7042],
      [-74.0140, 40.7230],
      [-74.0120, 40.7440],
      [-74.0095, 40.7589],
      [-74.0050, 40.7770],
      [-73.9988, 40.8200],
      [-73.9950, 40.8500],
    ],
  },
  trails: {
    type: "MultiLineString",
    coordinates: [
      [
        [-74.0163, 40.7042],
        [-74.0095, 40.7589],
      ],
      [
        [-74.0095, 40.7589],
        [-73.9988, 40.8200],
      ],
      [
        [-73.9988, 40.8200],
        [-73.9950, 40.8500],
      ],
    ],
  },
  boundaries: null,
  feature: {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [-74.0163, 40.7042],
        [-73.9950, 40.8500],
      ],
    },
    properties: { name: "Greenway centerline", surface: "asphalt" },
  },
  features: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-74.0163, 40.7042] },
        properties: { name: "Battery Park" },
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-74.0095, 40.7589] },
        properties: { name: "Pier 84" },
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-73.9988, 40.82] },
        properties: { name: "Riverside Park" },
      },
    ],
  },
  geometries: {
    type: "GeometryCollection",
    geometries: [
      { type: "Point", coordinates: [-74.0095, 40.7589] },
      {
        type: "LineString",
        coordinates: [
          [-74.0163, 40.7042],
          [-73.9950, 40.85],
        ],
      },
    ],
  },
  geom: {
    type: "LineString",
    coordinates: [
      [-74.0163, 40.7042],
      [-73.9950, 40.85],
    ],
  },
};

export const placesSeed: Place[] = [
  centralPark,
  brooklynBridge,
  highLine,
  reservoir,
  coneyIsland,
  statueOfLiberty,
  prospectPark,
  hudsonGreenway,
];
