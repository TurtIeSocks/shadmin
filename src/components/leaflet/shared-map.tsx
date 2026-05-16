"use client";

import { type ReactNode, useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type * as L from "leaflet";

import { DEFAULT_ATTRIBUTION, DEFAULT_TILE_URL } from "./shared";
import type { BaseMapProps } from "./types";

export interface BaseMapWrapperProps extends BaseMapProps {
  children?: ReactNode;
  testId?: string;
  className?: string;
}

export const BaseMap = ({
  zoom = 13,
  defaultCenter = [0, 0],
  height = 300,
  tileUrl = DEFAULT_TILE_URL,
  attribution = DEFAULT_ATTRIBUTION,
  children,
  testId,
  className,
}: BaseMapWrapperProps) => (
  <div
    style={{ height, width: "100%" }}
    className={className ?? "overflow-hidden rounded-md border"}
    data-testid={testId}
  >
    <MapContainer
      center={defaultCenter}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url={tileUrl} attribution={attribution} />
      {children}
    </MapContainer>
  </div>
);

export const FitBoundsOnMount = ({ bounds }: { bounds: L.LatLngBoundsExpression | null }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [20, 20], maxZoom: 18 });
  }, [bounds, map]);
  return null;
};
