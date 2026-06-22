import { DataTable, List } from "shadmin/components/admin";
import { LatLngField } from "shadmin/components/leaflet";

// Each row renders a small interactive map at the customer's seeded
// latitude/longitude — LatLngField reads them straight off the record.
const LocationCell = () => (
  <div className="w-72">
    <LatLngField
      latSource="latitude"
      lngSource="longitude"
      zoom={9}
      height={150}
    />
  </div>
);

/**
 * Map feature — the customers list with a live per-row Leaflet map column.
 * Demonstrates shadmin/leaflet's LatLngField against the demo's seeded coords.
 */
export default function MapDemo() {
  return (
    <List
      resource="customers"
      perPage={5}
      sort={{ field: "last_name", order: "ASC" }}
    >
      <DataTable>
        <DataTable.Col source="first_name" label="First name" />
        <DataTable.Col source="last_name" label="Last name" />
        <DataTable.Col
          source="email"
          label="Email"
          className="hidden lg:table-cell"
        />
        <DataTable.Col label="Location">
          <LocationCell />
        </DataTable.Col>
      </DataTable>
    </List>
  );
}
