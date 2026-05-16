"use client";
import { Plus } from "lucide-react";
import { OsmFeatureOperator, type OsmFeatureOperatorProps } from "./osm-feature-operator";

export type OsmFeatureAddProps = Omit<
  OsmFeatureOperatorProps,
  "mode" | "icon"
>;

export const OsmFeatureAdd = (props: OsmFeatureAddProps) => (
  <OsmFeatureOperator
    {...props}
    mode="add"
    icon={Plus}
    label={props.label ?? "Add OSM features"}
  />
);
