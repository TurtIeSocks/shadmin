import { StoryAdmin } from "@/test/_test-helpers";
import { CurrencyField } from "@/components/extras";

export default { title: "Data Display/CurrencyField" };

export const Basic = () => (
  <StoryAdmin record={{ price: 1234.5 }}>
    <CurrencyField source="price" currency="USD" />
  </StoryAdmin>
);

export const Eur = () => (
  <StoryAdmin record={{ price: 999.99 }}>
    <CurrencyField source="price" currency="EUR" displayLocale="de-DE" />
  </StoryAdmin>
);

export const MinorUnits = () => (
  <StoryAdmin record={{ price: 12345 }}>
    <CurrencyField source="price" currency="USD" storeAsMinorUnits />
  </StoryAdmin>
);

export const Composite = () => (
  <StoryAdmin record={{ price: { amount: 1234.5, currency: "JPY" } }}>
    <CurrencyField source="price" />
  </StoryAdmin>
);

export const Empty = () => (
  <StoryAdmin record={{ price: null }}>
    <CurrencyField source="price" currency="USD" empty="—" />
  </StoryAdmin>
);
