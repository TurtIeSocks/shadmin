import type * as L from "leaflet";
import type { ReactNode } from "react";

export type ShapeKind =
  | "Point"
  | "MultiPoint"
  | "LineString"
  | "MultiLineString"
  | "Polygon"
  | "MultiPolygon"
  | "GeometryCollection";

export type GeomanShape =
  | "Marker"
  | "CircleMarker"
  | "Line"
  | "Polygon"
  | "Rectangle"
  | "Circle"
  | "Text";

export interface BaseMapProps {
  zoom?: number;
  defaultCenter?: [number, number];
  height?: number | string;
  tileUrl?: string;
  attribution?: string;
}

export interface BaseFieldProps extends BaseMapProps {
  source: string;
  pathOptions?: L.PathOptions;
  markerIcon?: L.Icon | L.DivIcon;
  fitBounds?: boolean;
  emptyText?: ReactNode;
}

export interface BaseInputProps extends BaseMapProps {
  source: string;
  label?: ReactNode;
  helperText?: ReactNode;
  disabled?: boolean;
  pathOptions?: L.PathOptions;
  snappable?: boolean;
  snapDistance?: number;
  validate?:
    | ((v: unknown) => string | undefined)
    | Array<(v: unknown) => string | undefined>;
}
