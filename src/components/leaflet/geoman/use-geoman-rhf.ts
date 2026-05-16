"use client";

import { useCallback, useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useMap } from "react-leaflet";
import L from "leaflet";

import type { ShapeKind } from "../types";
import { geometryToLayer, layerToGeometry } from "./geoman-shape-mapping";

export interface UseGeomanRHFOptions {
  source: string;
  shape: ShapeKind;
  multi: boolean;
  collection?: boolean;
  validate?: (geom: GeoJSON.Geometry) => string | undefined;
  pathOptions?: L.PathOptions;
  markerIcon?: L.Icon | L.DivIcon;
  /**
   * Optional converter that transforms the drawn `GeoJSON.Geometry` into the
   * shape stored in the form value. Used by `BBoxInput` to persist
   * `[w, s, e, n]` instead of a `Polygon`. Defaults to identity.
   */
  valueTransform?: (geom: GeoJSON.Geometry) => unknown;
  /**
   * Optional inverse of `valueTransform`: parses the stored value back into a
   * `GeoJSON.Geometry` for hydration. Return `null` for malformed input.
   * Defaults to an identity-with-type-check.
   */
  valueParse?: (stored: unknown) => GeoJSON.Geometry | null;
}

export interface UseGeomanRHFReturn {
  featureGroupRef: React.MutableRefObject<L.FeatureGroup | null>;
  geomanProps: {
    onCreate: (layer: L.Layer) => void;
    onUpdate: (layer: L.Layer) => void;
    onRemove: (layer: L.Layer) => void;
    onCut: (newLayer: L.Layer, originalLayer: L.Layer) => void;
  };
}

export const useGeomanRHF = ({
  source,
  shape,
  multi,
  collection,
  validate,
  pathOptions,
  markerIcon,
  valueTransform,
  valueParse,
}: UseGeomanRHFOptions): UseGeomanRHFReturn => {
  const form = useFormContext();
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);
  const value = useWatch({ name: source }) as unknown;
  const hydrated = useRef(false);
  // Tracks the most recent value this hook wrote into the form. Used to dedup
  // the echo `useWatch` fires after our own `setValue`, so the hydration effect
  // only rebuilds the layer when the form value changes from outside the hook.
  const lastWrittenValue = useRef<unknown>(undefined);

  // useMap is safe because this hook is only called inside a MapContainer subtree.
  const map = useMap();

  // Initialize the feature group + hydrate from form value. Runs on first
  // mount and on every subsequent external change to `value` (i.e. any update
  // not caused by our own `persist()` write).
  useEffect(() => {
    if (!featureGroupRef.current) {
      featureGroupRef.current = L.featureGroup().addTo(map);
    }
    const group = featureGroupRef.current;
    const buildLayer = () => {
      if (value == null) return null;
      const geom = valueParse
        ? valueParse(value)
        : ((value as GeoJSON.Geometry | null | undefined) ?? null);
      if (!geom) return null;
      return geometryToLayer(geom, pathOptions, markerIcon);
    };

    if (!hydrated.current) {
      const layer = buildLayer();
      if (layer) group.addLayer(layer);
      lastWrittenValue.current = value;
      hydrated.current = true;
      return;
    }

    // Subsequent runs: skip if this is just the echo of our own write.
    if (JSON.stringify(value) === JSON.stringify(lastWrittenValue.current)) {
      return;
    }

    // External change — rebuild the layer from scratch.
    group.clearLayers();
    const layer = buildLayer();
    if (layer) group.addLayer(layer);
    lastWrittenValue.current = value;
  }, [map, value, pathOptions, markerIcon, valueParse]);

  const persist = useCallback(() => {
    const group = featureGroupRef.current;
    if (!group) return;
    const layers = group.getLayers();
    const write = (geom: GeoJSON.Geometry | null) => {
      const stored = valueTransform && geom ? valueTransform(geom) : geom;
      form.setValue(source, stored, { shouldDirty: true });
      lastWrittenValue.current = stored;
    };
    if (layers.length === 0) {
      form.setValue(source, null, { shouldDirty: true });
      lastWrittenValue.current = null;
      return;
    }
    if (collection) {
      const geometries = layers
        .map((l) => layerToGeometry(l))
        .filter((g): g is GeoJSON.Geometry => g !== null);
      write({ type: "GeometryCollection", geometries });
      return;
    }
    if (multi) {
      // Combine into Multi* geometry of the configured shape kind.
      const geometries = layers
        .map((l) => layerToGeometry(l))
        .filter((g): g is GeoJSON.Geometry => g !== null);
      const combined = combineMulti(shape, geometries);
      if (validate && combined && validate(combined)) {
        // Validation failed — leave previous value untouched.
        return;
      }
      write(combined);
      return;
    }
    // Single feature — use the first/most-recent layer.
    const geom = layerToGeometry(layers[layers.length - 1]);
    if (validate && geom && validate(geom)) return;
    write(geom);
  }, [collection, multi, shape, source, form, validate, valueTransform]);

  const handleCreate = useCallback(
    (layer: L.Layer) => {
      const group = featureGroupRef.current;
      if (!group) return;
      // Remove from the map (Geoman adds it there) and move into our group.
      map.removeLayer(layer);
      if (!multi && !collection) {
        // Replace existing layer.
        group.clearLayers();
      }
      group.addLayer(layer);
      persist();
    },
    [collection, map, multi, persist],
  );

  const handleUpdate = useCallback(() => persist(), [persist]);
  const handleRemove = useCallback(() => persist(), [persist]);
  const handleCut = useCallback(
    (newLayer: L.Layer, originalLayer: L.Layer) => {
      const group = featureGroupRef.current;
      if (!group) return;
      map.removeLayer(newLayer);
      group.removeLayer(originalLayer);
      group.addLayer(newLayer);
      persist();
    },
    [map, persist],
  );

  return {
    featureGroupRef,
    geomanProps: {
      onCreate: handleCreate,
      onUpdate: handleUpdate,
      onRemove: handleRemove,
      onCut: handleCut,
    },
  };
};

const combineMulti = (shape: ShapeKind, geoms: GeoJSON.Geometry[]): GeoJSON.Geometry | null => {
  if (geoms.length === 0) return null;
  switch (shape) {
    case "MultiPoint":
      return {
        type: "MultiPoint",
        coordinates: geoms
          .filter((g): g is GeoJSON.Point => g.type === "Point")
          .map((g) => g.coordinates),
      };
    case "MultiLineString":
      return {
        type: "MultiLineString",
        coordinates: geoms
          .filter((g): g is GeoJSON.LineString => g.type === "LineString")
          .map((g) => g.coordinates),
      };
    case "MultiPolygon":
      return {
        type: "MultiPolygon",
        coordinates: geoms
          .filter((g): g is GeoJSON.Polygon => g.type === "Polygon")
          .map((g) => g.coordinates),
      };
    default:
      // Single-shape kind with multi:true — keep the most recent only.
      return geoms[geoms.length - 1];
  }
};
