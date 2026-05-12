import type { ResourceProps } from "ra-core";
import { ComponentGallery } from "./ComponentGallery";
import { Component } from "lucide-react";

export const componentGallery: ResourceProps = {
  name: "component_gallery",
  list: ComponentGallery,
  icon: Component,
};
