/**
 * Builds the seed data for the fakerest demo.
 *
 * Uses data-generator-retail for the base 5 resources, then augments with
 * deterministic extra fields + a synthesised `tags` resource.
 *
 * No import.meta.env references here — this file is consumed by node:test.
 */
import generateRetailData from "data-generator-retail";

// ---------------------------------------------------------------------------
// Deterministic helpers (no Math.random in code-paths the test reads)
// ---------------------------------------------------------------------------

const HEX_PALETTE = [
  "#e53935",
  "#8e24aa",
  "#1e88e5",
  "#43a047",
  "#fb8c00",
  "#00897b",
  "#f06292",
  "#fdd835",
] as const;

function pickHex(id: number): string {
  return HEX_PALETTE[id % HEX_PALETTE.length];
}

const STATUSES = ["draft", "active", "archived"] as const;

function pickStatus(id: number): (typeof STATUSES)[number] {
  return STATUSES[id % STATUSES.length];
}

/** Deterministic rating 0–5 from id */
function deterministicRating(id: number): number {
  return parseFloat((((id * 7 + 3) % 41) / 8 + 1).toFixed(1));
}

/** Deterministic lat/lng from id (within continental US) */
function deterministicLatLng(id: number): {
  latitude: number;
  longitude: number;
} {
  const lat = 25 + ((id * 13 + 7) % 24);
  const lng = -(65 + ((id * 17 + 11) % 55));
  return { latitude: lat, longitude: lng };
}

// ---------------------------------------------------------------------------
// Tags (synthesised, 8 items, stable)
// ---------------------------------------------------------------------------

const TAGS = [
  { id: 0, name: "New Arrival", color: "#e53935" },
  { id: 1, name: "Best Seller", color: "#8e24aa" },
  { id: 2, name: "On Sale", color: "#1e88e5" },
  { id: 3, name: "Limited Edition", color: "#43a047" },
  { id: 4, name: "Eco Friendly", color: "#fb8c00" },
  { id: 5, name: "Featured", color: "#00897b" },
  { id: 6, name: "Vintage", color: "#f06292" },
  { id: 7, name: "Exclusive", color: "#fdd835" },
];

// ---------------------------------------------------------------------------
// Type definitions for generated records
// ---------------------------------------------------------------------------

interface RetailRecord extends Record<string, unknown> {
  id: number;
}

// ---------------------------------------------------------------------------
// Main build function
// ---------------------------------------------------------------------------

export interface SeedData {
  customers: RetailRecord[];
  categories: RetailRecord[];
  products: RetailRecord[];
  orders: RetailRecord[];
  reviews: RetailRecord[];
  tags: RetailRecord[];
}

export function buildSeedData(): SeedData {
  const raw = generateRetailData() as {
    customers: RetailRecord[];
    categories: RetailRecord[];
    products: RetailRecord[];
    orders: RetailRecord[];
    reviews: RetailRecord[];
    invoices: RetailRecord[];
    settings: unknown;
  };

  // --- customers: add lat/lng, favoriteColor, tag_ids ---
  const customers = raw.customers.map((c) => {
    const geo = deterministicLatLng(c.id);
    return {
      ...c,
      ...geo,
      favoriteColor: pickHex(c.id),
      metadata: {
        segment: "retail",
        tier: c.id % 3 === 0 ? "gold" : "standard",
      },
      tag_ids: [c.id % TAGS.length, (c.id + 3) % TAGS.length],
    };
  });

  // --- categories: add parent_id (first 3 are roots, rest reference them), color ---
  const rootIds = raw.categories.slice(0, 3).map((c) => c.id);
  const rootIdSet = new Set(rootIds);
  const categories = raw.categories.map((cat) => ({
    ...cat,
    parent_id: rootIdSet.has(cat.id) ? null : rootIds[cat.id % 3],
    color: pickHex(cat.id),
  }));

  // --- products: add color, status, rating, specs, tag_ids, warranty, datasheet ---
  const products = raw.products.map((p) => ({
    ...p,
    color: pickHex(p.id),
    status: pickStatus(p.id),
    rating: deterministicRating(p.id),
    specs: {
      material: "premium",
      dimensions: `${p.width as number}x${p.height as number}cm`,
      weight: `${((p.id % 10) + 1) * 100}g`,
    },
    tag_ids: [p.id % TAGS.length],
    warranty: ((p.id % 3) + 1) * 365 * 24 * 3600,
    datasheet: {
      src: `https://shadmin.turtlesocks.dev/docs/products/${p.id}.pdf`,
      title: `Product ${p.id} Datasheet`,
    },
  }));

  // --- orders: add items (mapped from basket), deliveryTime, trackingUrl ---
  const productById = new Map(products.map((p) => [p.id, p]));
  const orders = raw.orders.map((o) => {
    const basket = (o.basket ?? []) as Array<{
      product_id: number;
      quantity: number;
    }>;
    return {
      ...o,
      items: basket.map((b) => ({
        product_id: b.product_id,
        qty: b.quantity,
        unitPrice: Number(
          (productById.get(b.product_id) as Record<string, unknown>)?.price ?? 0,
        ),
      })),
      deliveryTime: ((o.id % 5) + 1) * 24 * 3600,
      trackingUrl: `https://tracking.shadmin.dev/${o.reference}`,
    };
  });

  // --- reviews: keep generator's, add `approved` field (deterministic) ---
  const reviews = raw.reviews.map((r) => ({
    ...r,
    approved: r.id % 3 !== 0,
  }));

  return {
    customers,
    categories,
    products,
    orders,
    reviews,
    tags: TAGS,
  };
}
