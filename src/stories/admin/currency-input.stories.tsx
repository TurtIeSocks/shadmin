import { StoryAdmin } from "@/stories/_test-helpers";
import { CurrencyInput } from "@/components/admin";

export default { title: "Data Edition/CurrencyInput" };

export const Basic = () => (
  <StoryAdmin mode="form" record={{ price: 1234.5 }}>
    <CurrencyInput source="price" currency="USD" />
  </StoryAdmin>
);

export const AllowCurrencyChange = () => (
  <StoryAdmin mode="form" record={{ price: { amount: 1234.5, currency: "EUR" } }}>
    <CurrencyInput source="price" currencies={["USD", "EUR", "JPY", "GBP"]} />
  </StoryAdmin>
);

export const MinorUnits = () => (
  <StoryAdmin mode="form" record={{ price: 12345 }}>
    <CurrencyInput source="price" currency="USD" storeAsMinorUnits />
  </StoryAdmin>
);

export const Disabled = () => (
  <StoryAdmin mode="form" record={{ price: 1234.5 }}>
    <CurrencyInput source="price" currency="USD" disabled />
  </StoryAdmin>
);

export const Yen = () => (
  <StoryAdmin mode="form" record={{ price: 12000 }}>
    <CurrencyInput source="price" currency="JPY" displayLocale="ja-JP" />
  </StoryAdmin>
);
