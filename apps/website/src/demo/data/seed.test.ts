// apps/www-v2/src/demo/data/seed.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSeedData } from "./seed.ts";

test("seed has all 6 resources, non-empty", () => {
  const d = buildSeedData();
  for (const r of [
    "customers",
    "categories",
    "products",
    "orders",
    "reviews",
    "tags",
  ] as const) {
    assert.ok(
      Array.isArray(d[r]) && d[r].length > 0,
      `${r} present + non-empty`,
    );
  }
});

test("customers carry geo (lat/lng) for the map", () => {
  const c = buildSeedData().customers[0] as Record<string, unknown>;
  assert.equal(typeof c.latitude, "number");
  assert.equal(typeof c.longitude, "number");
});

test("products carry the coverage attributes", () => {
  const p = buildSeedData().products[0] as Record<string, unknown>;
  for (const k of [
    "price",
    "stock",
    "rating",
    "category_id",
    "color",
    "status",
    "specs",
  ]) {
    assert.ok(k in p, `product.${k}`);
  }
});

test("reviews reference both customer and product", () => {
  const r = buildSeedData().reviews[0] as Record<string, unknown>;
  assert.ok("customer_id" in r && "product_id" in r && "rating" in r);
  assert.ok("approved" in r, "review.approved");
});

test("order items carry the referenced product's unit price", () => {
  const d = buildSeedData();
  const priceById = new Map(d.products.map((p) => [p.id, Number(p.price)]));
  const order = d.orders.find(
    (o) => Array.isArray(o.items) && (o.items as unknown[]).length > 0,
  );
  assert.ok(order, "an order with items exists");
  for (const it of order.items as Array<Record<string, unknown>>) {
    assert.equal(Number(it.unitPrice), priceById.get(it.product_id) ?? 0);
  }
});
