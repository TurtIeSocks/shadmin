"use client";
import { Eraser } from "lucide-react";
import { OsmFeatureOperator, type OsmFeatureOperatorProps } from "./osm-feature-operator";

export type OsmFeatureSubtractProps = Omit<
  OsmFeatureOperatorProps,
  "mode" | "icon"
>;

export const OsmFeatureSubtract = (props: OsmFeatureSubtractProps) => (
  <OsmFeatureOperator
    {...props}
    mode="subtract"
    icon={Eraser}
    label={props.label ?? "Subtract OSM features"}
  />
);
