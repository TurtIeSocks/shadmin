"use client";

import { BaseMap } from "../shared-map";
import { GeomanControl } from "../geoman/geoman-control";
import { GeomanEvents } from "../geoman/geoman-events";
import { useGeomanRHF } from "../geoman/use-geoman-rhf";
import { geojsonTypeToGeomanShape } from "../geoman/geoman-shape-mapping";
import type { BaseInputProps, ShapeKind } from "../types";

export interface ShapeInputShellProps extends BaseInputProps {
  shape: ShapeKind;
  multi: boolean;
  collection?: boolean;
}

type ShellInnerProps = Pick<
  ShapeInputShellProps,
  "source" | "shape" | "multi" | "collection" | "snappable" | "snapDistance" | "pathOptions"
> & {
  disabled?: boolean;
  validate?: (geom: GeoJSON.Geometry) => string | undefined;
};

export const ShapeInputShell = ({
  source,
  shape,
  multi,
  collection,
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
          snappable={snappable}
          snapDistance={snapDistance}
          pathOptions={pathOptions}
          disabled={disabled}
          validate={combinedValidator}
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
  snappable,
  snapDistance,
  pathOptions,
  disabled,
  validate,
}: ShellInnerProps) => {
  const geomanShape = geojsonTypeToGeomanShape(shape);
  const { geomanProps } = useGeomanRHF({
    source,
    shape,
    multi,
    collection,
    validate,
    pathOptions,
  });
  if (disabled) return null;
  return (
    <>
      <GeomanControl
        position="topleft"
        shapes={[geomanShape]}
        edit
        drag
        remove
        cut={geomanShape === "Polygon"}
        snappable={snappable}
        snapDistance={snapDistance}
        pathOptions={pathOptions}
      />
      <GeomanEvents {...geomanProps} />
    </>
  );
};
