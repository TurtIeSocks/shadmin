import { JsonField } from "@/components/monaco/json-field";
import { StoryAdmin } from "@/stories/_test-helpers";

export default { title: "Data Display (Monaco)/JsonField" };

const objectRecord = {
  id: 1,
  config: { theme: "dark", retries: 3, tags: ["a", "b"] },
};

const stringRecord = {
  id: 2,
  config: '{"theme":"dark","retries":3}',
};

const nullRecord = { id: 3, config: null };

export const Basic = () => (
  <StoryAdmin record={objectRecord}>
    <JsonField source="config" />
  </StoryAdmin>
);

export const StringValue = () => (
  <StoryAdmin record={stringRecord}>
    <JsonField source="config" />
  </StoryAdmin>
);

export const CustomIndent = () => (
  <StoryAdmin record={objectRecord}>
    <JsonField source="config" indent={4} />
  </StoryAdmin>
);

export const Empty = () => (
  <StoryAdmin record={nullRecord}>
    <JsonField source="config" empty="No config" />
  </StoryAdmin>
);
