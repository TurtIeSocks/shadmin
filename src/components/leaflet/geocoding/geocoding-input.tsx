"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useGeocode, type UseGeocodeOptions } from "./use-geocode";

export interface GeocodingInputProps extends UseGeocodeOptions {
  source: string;
  latSource?: string;
  lngSource?: string;
  bboxSource?: string;
  placeholder?: string;
  label?: string;
}

export const GeocodingInput = ({
  source,
  latSource,
  lngSource,
  bboxSource,
  placeholder = "Search address or place…",
  label,
  ...geocodeOpts
}: GeocodingInputProps) => {
  const form = useFormContext();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { data: results = [], isFetching } = useGeocode(query, geocodeOpts);

  const onSelect = (r: (typeof results)[number]) => {
    form.setValue(source, r.displayName, { shouldDirty: true });
    if (latSource) form.setValue(latSource, r.lat, { shouldDirty: true });
    if (lngSource) form.setValue(lngSource, r.lng, { shouldDirty: true });
    if (bboxSource && r.bbox)
      form.setValue(bboxSource, r.bbox, { shouldDirty: true });
    setOpen(false);
    setQuery(r.displayName);
  };

  return (
    <div className="flex flex-col gap-1" data-slot="geocoding-input">
      {label ? <label className="text-sm font-medium">{label}</label> : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Command shouldFilter={false} className="rounded-md border">
            <CommandInput
              placeholder={placeholder}
              value={query}
              onValueChange={(v) => {
                setQuery(v);
                setOpen(v.length >= (geocodeOpts.minChars ?? 3));
              }}
            />
          </Command>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Command shouldFilter={false}>
            <CommandList>
              {isFetching ? (
                <CommandEmpty>Loading…</CommandEmpty>
              ) : results.length === 0 ? (
                <CommandEmpty>No results</CommandEmpty>
              ) : (
                <CommandGroup>
                  {results.map((r, i) => (
                    <CommandItem key={i} onSelect={() => onSelect(r)}>
                      <div className="flex flex-col">
                        <span>{r.displayName}</span>
                        {r.type ? (
                          <span className="text-xs text-muted-foreground">
                            {r.type}
                          </span>
                        ) : null}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
