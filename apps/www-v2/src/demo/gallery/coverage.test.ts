import { test } from "node:test";
import assert from "node:assert/strict";
import { coverageReport } from "./coverage.ts";

test("missing = doc slugs with no example", () => {
  const r = coverageReport(
    ["viewing/text-field", "viewing/rating-field"],
    ["viewing/text-field"],
  );
  assert.deepEqual(r.missing, ["viewing/rating-field"]);
  assert.deepEqual(r.covered, ["viewing/text-field"]);
});

test("all covered", () => {
  const r = coverageReport(["viewing/text-field"], ["viewing/text-field"]);
  assert.deepEqual(r.covered, ["viewing/text-field"]);
  assert.deepEqual(r.missing, []);
});

test("none covered", () => {
  const r = coverageReport(["viewing/text-field"], []);
  assert.deepEqual(r.covered, []);
  assert.deepEqual(r.missing, ["viewing/text-field"]);
});
