"use client";

import { BaseMap } from "../shared-map";
import { GeomanControl } from "../geoman/geoman-control";
import { GeomanEvents } from "../geoman/geoman-events";
import { useGeomanRHF } from "../geoman/use-geoman-rhf";
import { geojsonTypeToGeomanShape } from "../geoman/geoman-shape-mapping";
import type { BaseInputProps, GeomanShape, ShapeKind } from "../types";

export interface ShapeInputShellProps extends BaseInputProps {
  shape: ShapeKind;
  multi: boolean;
  collection?: boolean;
  /**
   * Override the toolbar draw buttons. When omitted, derived from `shape`.
   * Use when a single GeoJSON output type (e.g. Polygon) can be produced by
   * multiple draw modes (Polygon, Rectangle, Circle).
   */
  geomanShapes?: GeomanShape[];
  /**
   * Optional converter that transforms the drawn `GeoJSON.Geometry` into the
   * shape stored in the form value. Forwarded to `useGeomanRHF`.
   */
  valueTransform?: (geom: GeoJSON.Geometry) => unknown;
  /**
   * Optional inverse of `valueTransform` used during hydration. Forwarded to
   * `useGeomanRHF`.
   */
  valueParse?: (stored: unknown) => GeoJSON.Geometry | null;
}

type ShellInnerProps = Pick<
  ShapeInputShellProps,
  | "source"
  | "shape"
  | "multi"
  | "collection"
  | "geomanShapes"
  | "snappable"
  | "snapDistance"
  | "pathOptions"
  | "valueTransform"
  | "valueParse"
> & {
  disabled?: boolean;
  validate?: (geom: GeoJSON.Geometry) => string | undefined;
};

export const ShapeInputShell = ({
  source,
  shape,
  multi,
  collection,
  geomanShapes,
  zoom = 13,
  defaultCenter = [0, 0],
  height = 300,
  tileUrl,
  attribution,
  pathOptions,
  snappable = true,
  snapDistance = 20,
  label,
  helperText,
  disabled = false,
  validate,
  valueTransform,
  valueParse,
}: ShapeInputShellProps) => {
  const validators = Array.isArray(validate) ? validate : validate ? [validate] : [];
  const combinedValidator = validators.length
    ? (g: GeoJSON.Geometry) => {
        for (const v of validators) {
          const err = v(g);
          if (err) return err;
        }
        return undefined;
      }
    : undefined;

  return (
    <div className="flex flex-col gap-1" data-slot="shape-input">
      {label ? <label className="text-sm font-medium">{label}</label> : null}
      <BaseMap
        zoom={zoom}
        defaultCenter={defaultCenter}
        height={height}
        tileUrl={tileUrl}
        attribution={attribution}
        testId={`${shape.toLowerCase()}-input`}
        className={
          disabled
            ? "overflow-hidden rounded-md border pointer-events-none opacity-60"
            : undefined
        }
      >
        <ShellInner
          source={source}
          shape={shape}
          multi={multi}
          collection={collection}
          geomanShapes={geomanShapes}
          snappable={snappable}
          snapDistance={snapDistance}
          pathOptions={pathOptions}
          disabled={disabled}
          validate={combinedValidator}
          valueTransform={valueTransform}
          valueParse={valueParse}
        />
      </BaseMap>
      {helperText ? <div className="text-xs text-muted-foreground">{helperText}</div> : null}
    </div>
  );
};

const ShellInner = ({
  source,
  shape,
  multi,
  collection,
  geomanShapes,
  snappable,
  snapDistance,
  pathOptions,
  disabled,
  validate,
  valueTransform,
  valueParse,
}: ShellInnerProps) => {
  const geomanShape = geojsonTypeToGeomanShape(shape);
  const shapes = geomanShapes ?? [geomanShape];
  const { geomanProps } = useGeomanRHF({
    source,
    shape,
    multi,
    collection,
    validate,
    pathOptions,
    valueTransform,
    valueParse,
  });
  if (disabled) return null;
  return (
    <>
      <GeomanControl
        position="topleft"
        shapes={shapes}
        edit
        drag
        remove
        cut={shapes.some((s) => s === "Polygon" || s === "Rectangle" || s === "Circle")}
        snappable={snappable}
        snapDistance={snapDistance}
        pathOptions={pathOptions}
      />
      <GeomanEvents {...geomanProps} />
    </>
  );
};
