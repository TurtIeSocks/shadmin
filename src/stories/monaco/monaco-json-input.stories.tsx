import { useWatch } from "react-hook-form";
import { MonacoJsonInput } from "@/components/monaco/monaco-json-input";
import { StoryAdmin } from "@/stories/_test-helpers";

export default { title: "Data Edition (Monaco)/MonacoJsonInput" };

const objectRecord = {
  id: 1,
  metadata: { sku: "ABC-123", price: 4200 },
};

const stringRecord = {
  id: 2,
  metadata: '{"sku":"ABC-123","price":4200}',
};

const FormValues = () => {
  const values = useWatch();
  return <pre data-testid="form-values">{JSON.stringify(values, null, 2)}</pre>;
};

export const Basic = () => (
  <StoryAdmin mode="form" record={objectRecord}>
    <MonacoJsonInput source="metadata" />
    <FormValues />
  </StoryAdmin>
);

export const StringMode = () => (
  <StoryAdmin mode="form" record={stringRecord}>
    <MonacoJsonInput source="metadata" />
    <FormValues />
  </StoryAdmin>
);

export const WithSchema = () => (
  <StoryAdmin mode="form" record={objectRecord}>
    <MonacoJsonInput
      source="metadata"
      schema={{
        type: "object",
        properties: {
          sku: { type: "string" },
          price: { type: "number" },
        },
        required: ["sku", "price"],
        additionalProperties: false,
      }}
    />
    <FormValues />
  </StoryAdmin>
);

export const AutoHeight = () => (
  <StoryAdmin mode="form" record={objectRecord}>
    <MonacoJsonInput
      source="metadata"
      autoHeight
      minHeight={80}
      maxHeight={400}
    />
  </StoryAdmin>
);

export const ReadOnly = () => (
  <StoryAdmin mode="form" record={objectRecord}>
    <MonacoJsonInput source="metadata" readOnly />
  </StoryAdmin>
);

export const Disabled = () => (
  <StoryAdmin mode="form" record={objectRecord}>
    <MonacoJsonInput source="metadata" disabled />
  </StoryAdmin>
);

export const WithComments = () => (
  <StoryAdmin
    mode="form"
    record={{ id: 3, metadata: '{\n  // a comment\n  "sku":"ABC"\n}' }}
  >
    <MonacoJsonInput source="metadata" allowComments />
  </StoryAdmin>
);
