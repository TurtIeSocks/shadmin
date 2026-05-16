"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type L from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

import type { GeomanShape } from "../types";

export interface GeomanControlProps {
  position?: L.ControlPosition;
  shapes?: GeomanShape[];
  edit?: boolean;
  drag?: boolean;
  remove?: boolean;
  cut?: boolean;
  rotate?: boolean;
  oneBlock?: boolean;
  snappable?: boolean;
  snapDistance?: number;
  allowSelfIntersection?: boolean;
  pathOptions?: L.PathOptions;
  lang?: string;
}

const DEFAULT_SHAPES: GeomanShape[] = [
  "Marker",
  "Line",
  "Polygon",
  "Rectangle",
  "Circle",
];

/**
 * Attaches the Leaflet-Geoman drawing/editing toolbar to the parent
 * <MapContainer>. Must be rendered inside react-leaflet's <MapContainer>.
 *
 * Implemented with `useMap()` rather than `createControlComponent` from
 * `@react-leaflet/core` because `addControls` is an imperative call on
 * `map.pm`, not a true Leaflet `L.Control` instance.
 */
export const GeomanControl = ({
  position = "topleft",
  shapes = DEFAULT_SHAPES,
  edit = true,
  drag = true,
  remove = true,
  cut = true,
  rotate = false,
  oneBlock = false,
  snappable = true,
  snapDistance = 20,
  allowSelfIntersection = true,
  pathOptions,
  lang,
}: GeomanControlProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map.pm) return;
    const shapeSet = new Set(shapes);
    map.pm.addControls({
      position,
      oneBlock,
      drawMarker: shapeSet.has("Marker"),
      drawCircleMarker: shapeSet.has("CircleMarker"),
      drawPolyline: shapeSet.has("Line"),
      drawRectangle: shapeSet.has("Rectangle"),
      drawPolygon: shapeSet.has("Polygon"),
      drawCircle: shapeSet.has("Circle"),
      drawText: shapeSet.has("Text"),
      editMode: edit,
      dragMode: drag,
      cutPolygon: cut,
      removalMode: remove,
      rotateMode: rotate,
    });
    map.pm.setGlobalOptions({
      snappable,
      snapDistance,
      allowSelfIntersection,
      pathOptions: pathOptions ?? undefined,
    });
    if (lang) map.pm.setLang(lang as Parameters<typeof map.pm.setLang>[0]);

    return () => {
      if (map.pm) {
        map.pm.removeControls();
      }
    };
  }, [
    map,
    position,
    shapes,
    edit,
    drag,
    remove,
    cut,
    rotate,
    oneBlock,
    snappable,
    snapDistance,
    allowSelfIntersection,
    pathOptions,
    lang,
  ]);

  return null;
};
