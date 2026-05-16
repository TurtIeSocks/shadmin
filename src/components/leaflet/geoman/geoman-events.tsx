"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import type L from "leaflet";
import type { Layer, LeafletEventHandlerFn } from "leaflet";

import type { GeomanShape } from "../types";

export interface GeomanEventsProps {
  onCreate?: (layer: Layer, shape: GeomanShape) => void;
  onUpdate?: (layer: Layer) => void;
  onRemove?: (layer: Layer) => void;
  onCut?: (newLayer: Layer, originalLayer: Layer) => void;
}

/**
 * Event-bridge component that listens for Leaflet-Geoman events on the parent
 * <MapContainer> and wires per-layer events (`pm:update`, `pm:remove`) onto
 * each created layer.
 *
 * Handles the `pm:cut` ↔ `pm:edit` dedup gotcha: when a layer is cut, Geoman
 * fires both events; the `cutInProgress` ref + `queueMicrotask` flag lets
 * `pm:edit` handlers skip a duplicate notification within the same tick.
 */
export const GeomanEvents = ({
  onCreate,
  onUpdate,
  onRemove,
  onCut,
}: GeomanEventsProps) => {
  const map = useMap();
  const cutInProgress = useRef(false);

  useEffect(() => {
    const handleCreate = (e: unknown) => {
      const evt = e as { layer: Layer; shape: GeomanShape };
      evt.layer.on(
        "pm:update" as unknown as keyof L.LeafletEventHandlerFnMap,
        () => onUpdate?.(evt.layer),
      );
      evt.layer.on(
        "pm:remove" as unknown as keyof L.LeafletEventHandlerFnMap,
        () => onRemove?.(evt.layer),
      );
      onCreate?.(evt.layer, evt.shape);
    };
    const handleCut = (e: unknown) => {
      const evt = e as { layer: Layer; originalLayer: Layer };
      cutInProgress.current = true;
      onCut?.(evt.layer, evt.originalLayer);
      queueMicrotask(() => {
        cutInProgress.current = false;
      });
    };

    map.on(
      "pm:create" as unknown as keyof L.LeafletEventHandlerFnMap,
      handleCreate as LeafletEventHandlerFn,
    );
    map.on(
      "pm:cut" as unknown as keyof L.LeafletEventHandlerFnMap,
      handleCut as LeafletEventHandlerFn,
    );

    return () => {
      map.off(
        "pm:create" as unknown as keyof L.LeafletEventHandlerFnMap,
        handleCreate as LeafletEventHandlerFn,
      );
      map.off(
        "pm:cut" as unknown as keyof L.LeafletEventHandlerFnMap,
        handleCut as LeafletEventHandlerFn,
      );
    };
  }, [map, onCreate, onUpdate, onRemove, onCut]);

  return null;
};
