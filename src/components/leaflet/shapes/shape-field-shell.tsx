"use client";

import { useMemo } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import { useRecordContext } from "ra-core";
import L from "leaflet";

import { BaseMap, FitBoundsOnMount } from "../shared-map";
import { MarkerIcon } from "../shared";
import type { BaseFieldProps } from "../types";

export interface ShapeFieldShellProps extends BaseFieldProps {
  testId?: string;
}

const FitToData = ({ geom }: { geom: GeoJSON.Geometry }) => {
  useMap();
  const bounds = useMemo(() => {
    const layer = L.geoJSON(geom);
    const b = layer.getBounds();
    return b.isValid() ? b : null;
  }, [geom]);
  return <FitBoundsOnMount bounds={bounds} />;
};

export const ShapeFieldShell = ({
  source,
  zoom = 13,
  defaultCenter = [0, 0],
  height = 300,
  tileUrl,
  attribution,
  pathOptions = { color: "#3388ff" },
  markerIcon = MarkerIcon,
  fitBounds = true,
  emptyText = "No geometry available",
  testId,
}: ShapeFieldShellProps) => {
  const record = useRecordContext();
  const geom = record?.[source] as GeoJSON.Geometry | null | undefined;

  if (!geom) {
    return (
      <div
        style={{ height, width: "100%" }}
        className="flex items-center justify-center rounded-md border bg-muted/30 text-sm text-muted-foreground"
        data-slot="shape-field-empty"
      >
        {emptyText}
      </div>
    );
  }

  return (
    <BaseMap
      zoom={zoom}
      defaultCenter={defaultCenter}
      height={height}
      tileUrl={tileUrl}
      attribution={attribution}
      testId={testId}
    >
      <GeoJSON
        data={geom}
        style={() => pathOptions}
        pointToLayer={(_f, latlng) => L.marker(latlng, { icon: markerIcon })}
      />
      {fitBounds ? <FitToData geom={geom} /> : null}
    </BaseMap>
  );
};
