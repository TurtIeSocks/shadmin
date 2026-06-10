import {
  CreateButton,
  DataTable,
  ExportButton,
  List,
  ListPagination,
} from "shadcn-admin-kit/components/admin";
import { LatLngField } from "shadcn-admin-kit/components/leaflet";
import { Badge } from "shadcn-admin-kit/components/ui/badge";
import { useRecordContext } from "ra-core";
import type { Place } from "./places-seed";

const typeBadge = (type: Place["type"]) => {
  switch (type) {
    case "park":
      return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100";
    case "lake":
      return "bg-sky-100 text-sky-900 dark:bg-sky-900 dark:text-sky-100";
    case "trail":
      return "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100";
    case "monument":
      return "bg-stone-200 text-stone-900 dark:bg-stone-800 dark:text-stone-100";
  }
};

const TypeBadge = () => {
  const record = useRecordContext<Place>();
  if (!record) return null;
  return (
    <Badge variant="outline" className={typeBadge(record.type)}>
      {record.type}
    </Badge>
  );
};

const MiniMapCell = () => (
  <div className="w-64">
    <LatLngField latSource="lat" lngSource="lng" zoom={13} height={140} />
  </div>
);

export const MapList = () => (
  <List
    perPage={10}
    sort={{ field: "name", order: "ASC" }}
    actions={
      <div className="flex items-center gap-2">
        <CreateButton />
        <ExportButton />
      </div>
    }
  >
    <DataTable>
      <DataTable.Col source="name" />
      <DataTable.Col source="type">
        <TypeBadge />
      </DataTable.Col>
      <DataTable.Col source="address" className="hidden md:table-cell" />
      <DataTable.Col label="Location" className="hidden lg:table-cell">
        <MiniMapCell />
      </DataTable.Col>
    </DataTable>
    <ListPagination className="justify-start mt-2" />
  </List>
);
