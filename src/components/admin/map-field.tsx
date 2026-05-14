"use client";

import { type ReactNode, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useFormContext } from "react-hook-form";
import { useRecordContext } from "ra-core";

// Fix Leaflet default icon paths for vite/webpack bundlers
// (Leaflet ships icons via CSS but the image URLs are wrong by default in bundled builds)
const iconRetinaUrl =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const iconUrl =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const shadowUrl =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const DEFAULT_TILE_URL =
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const DEFAULT_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export interface MapFieldProps {
  latSource: string;
  lngSource: string;
  zoom?: number;
  height?: number | string;
  tileUrl?: string;
  attribution?: string;
}

/**
 * Displays a Leaflet map with a marker at the lat/lng position read from the current record.
 *
 * Reads two numeric fields from the record context (`latSource` and `lngSource`) and renders
 * an interactive (non-editable) tile map. Returns null when either coordinate is missing.
 *
 * @example
 * <Show>
 *   <SimpleShowLayout>
 *     <TextField source="name" />
 *     <MapField latSource="lat" lngSource="lng" zoom={13} height={300} />
 *   </SimpleShowLayout>
 * </Show>
 */
export const MapField = ({
  latSource,
  lngSource,
  zoom = 13,
  height = 300,
  tileUrl = DEFAULT_TILE_URL,
  attribution = DEFAULT_ATTRIBUTION,
}: MapFieldProps) => {
  const record = useRecordContext();
  const lat = record?.[latSource] as number | undefined;
  const lng = record?.[lngSource] as number | undefined;
  if (lat === undefined || lng === undefined) return null;
  return (
    <div style={{ height, width: "100%" }} data-slot="map-field" data-testid="map-field">
      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url={tileUrl} attribution={attribution} />
        <Marker position={[lat, lng]} />
      </MapContainer>
    </div>
  );
};

export interface MapInputProps {
  latSource: string;
  lngSource: string;
  defaultPosition?: [number, number];
  zoom?: number;
  height?: number | string;
  tileUrl?: string;
  attribution?: string;
  label?: ReactNode;
  helperText?: ReactNode;
}

const DraggableMarker = ({
  position,
  onChange,
}: {
  position: [number, number];
  onChange: (lat: number, lng: number) => void;
}) => {
  const markerRef = useRef<L.Marker>(null);
  useMapEvents({
    click: (e) => onChange(e.latlng.lat, e.latlng.lng),
  });
  return (
    <Marker
      position={position}
      draggable
      ref={markerRef}
      eventHandlers={{
        dragend: () => {
          const ll = markerRef.current?.getLatLng();
          if (ll) onChange(ll.lat, ll.lng);
        },
      }}
    />
  );
};

const RecenterOnChange = ({ position }: { position: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom(), { animate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position[0], position[1]]);
  return null;
};

/**
 * Map form input. Renders a draggable Leaflet marker; clicking the map or dragging the marker
 * updates two React Hook Form fields (`latSource` and `lngSource`) via `setValue`.
 *
 * Must be rendered inside a React Hook Form context (e.g. `<SimpleForm>`, `<Form>`).
 *
 * @example
 * <Create>
 *   <SimpleForm>
 *     <MapInput
 *       latSource="lat"
 *       lngSource="lng"
 *       defaultPosition={[48.85, 2.35]}
 *       height={300}
 *       label="Location"
 *       helperText="Click or drag the marker to set a location."
 *     />
 *   </SimpleForm>
 * </Create>
 */
export const MapInput = ({
  latSource,
  lngSource,
  defaultPosition = [0, 0],
  zoom = 13,
  height = 300,
  tileUrl = DEFAULT_TILE_URL,
  attribution = DEFAULT_ATTRIBUTION,
  label,
  helperText,
}: MapInputProps) => {
  const form = useFormContext();
  const latValue = form?.watch(latSource) as number | undefined;
  const lngValue = form?.watch(lngSource) as number | undefined;
  const lat = typeof latValue === "number" ? latValue : defaultPosition[0];
  const lng = typeof lngValue === "number" ? lngValue : defaultPosition[1];

  const handleChange = (newLat: number, newLng: number) => {
    form?.setValue(latSource, newLat, { shouldDirty: true });
    form?.setValue(lngSource, newLng, { shouldDirty: true });
  };

  return (
    <div className="flex flex-col gap-1" data-slot="map-input" data-testid="map-input">
      {label ? (
        <label className="text-sm font-medium">{label}</label>
      ) : null}
      <div
        style={{ height, width: "100%" }}
        className="overflow-hidden rounded-md border"
      >
        <MapContainer
          center={[lat, lng]}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url={tileUrl} attribution={attribution} />
          <DraggableMarker position={[lat, lng]} onChange={handleChange} />
          <RecenterOnChange position={[lat, lng]} />
        </MapContainer>
      </div>
      {helperText ? (
        <div className="text-xs text-muted-foreground">{helperText}</div>
      ) : null}
    </div>
  );
};
