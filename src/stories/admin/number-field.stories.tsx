import { StoryAdmin } from "@/stories/_test-helpers";
import { NumberField } from "@/components/admin";

export default { title: "Data Display/NumberField" };

const record = {
  id: 1,
  views: 1234567,
  price: 49.95,
  ratio: 0.42,
};

export const Basic = () => (
  <StoryAdmin record={record}>
    <NumberField source="views" />
  </StoryAdmin>
);

export const Currency = () => (
  <StoryAdmin record={record}>
    <NumberField
      source="price"
      options={{ style: "currency", currency: "USD" }}
    />
  </StoryAdmin>
);

export const Percent = () => (
  <StoryAdmin record={record}>
    <NumberField source="ratio" options={{ style: "percent" }} />
  </StoryAdmin>
);

export const Locale = () => (
  <StoryAdmin record={record}>
    <NumberField source="views" locales="fr-FR" />
  </StoryAdmin>
);

export const Empty = () => (
  <StoryAdmin record={{ id: 1 }}>
    <NumberField source="views" empty="—" />
  </StoryAdmin>
);
