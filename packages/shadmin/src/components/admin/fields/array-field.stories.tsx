import { StoryAdmin } from "@/test/_test-helpers";
import {
  ArrayField,
  BadgeField,
  DataTable,
  SingleFieldList,
  TextField,
} from "@/components/admin";

export default { title: "Data Display/ArrayField" };

const record = {
  id: 1,
  title: "Hitchhiker's Guide",
  tags: [
    { id: "sci-fi", name: "Sci-Fi" },
    { id: "comedy", name: "Comedy" },
    { id: "british", name: "British" },
  ],
  ratings: [
    { id: 1, source: "Goodreads", value: 4.6 },
    { id: 2, source: "Amazon", value: 4.5 },
  ],
};

export const Basic = () => (
  <StoryAdmin record={record}>
    <ArrayField source="tags">
      <SingleFieldList>
        <BadgeField source="name" />
      </SingleFieldList>
    </ArrayField>
  </StoryAdmin>
);

export const InDataTable = () => (
  <StoryAdmin record={record}>
    <ArrayField source="ratings">
      <DataTable bulkActionsToolbar={false}>
        <DataTable.Col source="source" />
        <DataTable.Col source="value">
          <TextField source="value" />
        </DataTable.Col>
      </DataTable>
    </ArrayField>
  </StoryAdmin>
);

export const Empty = () => (
  <StoryAdmin record={{ id: 1, tags: [] }}>
    <ArrayField source="tags">
      <SingleFieldList>
        <BadgeField source="name" />
      </SingleFieldList>
    </ArrayField>
  </StoryAdmin>
);
