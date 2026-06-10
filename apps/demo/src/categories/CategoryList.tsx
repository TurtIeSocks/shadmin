import { DataTable, List } from "shadcn-admin-kit/components/admin";
import { ColorField } from "shadcn-admin-kit/components/extras/color-field";

/**
 * Categories list rendered as a simple table with a color swatch column.
 *
 * The retail demo dataset's categories are flat, so a table view is the
 * natural display. The leading column shows the seeded brand color via
 * `<ColorField>`, demonstrating the extras color picker round-trip
 * (edit -> seed -> list display).
 */
export const CategoryList = () => (
  <List pagination={false} perPage={50}>
    <DataTable>
      <DataTable.Col source="color" label="Color">
        <ColorField source="color" showLabel={false} />
      </DataTable.Col>
      <DataTable.Col source="name" />
    </DataTable>
  </List>
);
