import { DataTable, List } from "shadcn-admin-kit/components/admin";
import { ColorField } from "shadcn-admin-kit/components/extras/color-field";
import { TreeList } from "shadcn-admin-kit/components/extras/tree-list";

/**
 * Categories list rendered as a table with a color swatch column, paired with
 * a `<TreeList>` sidebar.
 *
 * The seed dataset assigns each category a `parent_id` (see `dataProvider.ts`),
 * forming a 2-level taxonomy. `<TreeList>` reads the surrounding list context
 * and renders that hierarchy as an expand/collapse tree; clicking a node
 * navigates to the category's show/edit page. The leading table column shows
 * the seeded brand color via `<ColorField>`, demonstrating the extras color
 * picker round-trip (edit -> seed -> list display).
 */
export const CategoryList = () => (
  <List pagination={false} perPage={50}>
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="md:w-64 md:self-start">
        <TreeList parentSource="parent_id" titleSource="name" defaultExpanded />
      </div>
      <div className="flex-1">
        <DataTable>
          <DataTable.Col source="color" label="Color">
            <ColorField source="color" showLabel={false} />
          </DataTable.Col>
          <DataTable.Col source="name" />
        </DataTable>
      </div>
    </div>
  </List>
);
