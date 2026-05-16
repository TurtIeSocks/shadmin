"use client";

import { useRecordContext } from "ra-core";

import {
  useReverseGeocode,
  type UseReverseGeocodeOptions,
} from "./use-reverse-geocode";

export interface ReverseGeocodeFieldProps extends UseReverseGeocodeOptions {
  latSource: string;
  lngSource: string;
  format?: "full" | "street" | "city";
  className?: string;
}

export const ReverseGeocodeField = ({
  latSource,
  lngSource,
  format = "full",
  className,
  ...opts
}: ReverseGeocodeFieldProps) => {
  const record = useRecordContext();
  const lat = record?.[latSource] as number | undefined;
  const lng = record?.[lngSource] as number | undefined;
  const { data, isLoading } = useReverseGeocode({ lat, lng }, opts);

  if (lat == null || lng == null) return null;

  const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  const display = isLoading || !data ? fallback : data.displayName;
  const text =
    format === "full"
      ? display
      : display
          .split(",")
          .slice(0, format === "street" ? 1 : 2)
          .join(",");

  return (
    <span className={className} data-slot="reverse-geocode-field">
      {text}
    </span>
  );
};
