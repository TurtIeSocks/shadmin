import { MonacoJsonField } from "@/components/monaco/monaco-json-field";
import { StoryAdmin } from "@/test/_test-helpers";

export default { title: "Data Display (Monaco)/MonacoJsonField" };

const objectRecord = {
  id: 1,
  config: { theme: "dark", retries: 3, tags: ["a", "b"] },
};

const stringRecord = {
  id: 2,
  config: '{"theme":"dark","retries":3}',
};

export const Basic = () => (
  <StoryAdmin record={objectRecord}>
    <MonacoJsonField source="config" />
  </StoryAdmin>
);

export const StringValue = () => (
  <StoryAdmin record={stringRecord}>
    <MonacoJsonField source="config" />
  </StoryAdmin>
);

export const FixedHeight = () => (
  <StoryAdmin record={objectRecord}>
    <MonacoJsonField source="config" autoHeight={false} height={300} />
  </StoryAdmin>
);
