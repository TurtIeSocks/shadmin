import {
  Edit,
  NumberInput,
  SelectInput,
  SimpleForm,
  TextInput,
} from "shadcn-admin-kit/components/admin";
import { required } from "ra-core";

const REGION_CHOICES = [
  { id: "EU", name: "EU" },
  { id: "US", name: "US" },
  { id: "APAC", name: "APAC" },
];

const QUARTER_CHOICES = [
  { id: "Q1", name: "Q1" },
  { id: "Q2", name: "Q2" },
  { id: "Q3", name: "Q3" },
  { id: "Q4", name: "Q4" },
];

export const AnalyticsEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" validate={required()} />
      <SelectInput
        source="region"
        choices={REGION_CHOICES}
        validate={required()}
      />
      <SelectInput
        source="quarter"
        choices={QUARTER_CHOICES}
        validate={required()}
      />
      <NumberInput source="revenue" validate={required()} />
      <NumberInput source="customers" validate={required()} />
    </SimpleForm>
  </Edit>
);
