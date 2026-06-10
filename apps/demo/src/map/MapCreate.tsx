import { Create, SelectInput, SimpleForm, TextInput } from "shadcn-admin-kit/components/admin";
import { GeocodingInput, LatLngInput, PointInput } from "shadcn-admin-kit/components/leaflet";
import { required } from "ra-core";

const NYC_CENTER: [number, number] = [40.74, -73.99];
const PLACE_TYPE_CHOICES = [
  { id: "park", name: "Park" },
  { id: "lake", name: "Lake" },
  { id: "trail", name: "Trail" },
  { id: "monument", name: "Monument" },
];

export const MapCreate = () => (
  <Create redirect="show">
    <SimpleForm
      defaultValues={{
        type: "park",
        lat: NYC_CENTER[0],
        lng: NYC_CENTER[1],
      }}
    >
      <TextInput source="name" validate={required()} />
      <SelectInput
        source="type"
        choices={PLACE_TYPE_CHOICES}
        validate={required()}
      />
      <GeocodingInput
        source="address"
        latSource="lat"
        lngSource="lng"
        label="Search address (autofills coordinates)"
        placeholder="Search a place…"
      />
      <TextInput source="address" multiline rows={2} />
      <LatLngInput
        latSource="lat"
        lngSource="lng"
        defaultPosition={NYC_CENTER}
        height={320}
        label="Pin location"
        helperText="Click or drag the marker to choose a spot."
      />
      <PointInput
        source="location"
        label="GeoJSON location point"
        defaultCenter={NYC_CENTER}
        height={320}
        helperText="Optional — defaults to the lat/lng above when omitted."
      />
    </SimpleForm>
  </Create>
);
