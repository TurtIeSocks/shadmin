import { ResourceProps } from "ra-core";
import { MapPin } from "lucide-react";
import { MapList } from "./MapList";
import { MapShow } from "./MapShow";
import { MapEdit } from "./MapEdit";
import { MapCreate } from "./MapCreate";

export const places: ResourceProps = {
  name: "places",
  list: MapList,
  show: MapShow,
  edit: MapEdit,
  create: MapCreate,
  recordRepresentation: "name",
  icon: MapPin,
};

export { MapList, MapShow, MapEdit, MapCreate };
export { placesSeed } from "./places-seed";
export type { Place, PlaceType } from "./places-seed";
