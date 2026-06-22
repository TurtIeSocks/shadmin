import { StoryAdmin } from "@/test/_test-helpers";
import { PhoneInput } from "@/components/admin";

export default { title: "Data Edition/PhoneInput" };

export const Basic = () => (
  <StoryAdmin mode="form" record={{ phone: "+14155552671" }}>
    <PhoneInput source="phone" />
  </StoryAdmin>
);

export const DefaultCountryUS = () => (
  <StoryAdmin mode="form" record={{ phone: "" }}>
    <PhoneInput source="phone" defaultCountry="US" />
  </StoryAdmin>
);

export const RestrictedCountries = () => (
  <StoryAdmin mode="form" record={{ phone: "+14155552671" }}>
    <PhoneInput source="phone" allowedCountries={["US", "CA", "MX"]} />
  </StoryAdmin>
);

export const Disabled = () => (
  <StoryAdmin mode="form" record={{ phone: "+14155552671" }}>
    <PhoneInput source="phone" disabled />
  </StoryAdmin>
);

export const NoLabel = () => (
  <StoryAdmin mode="form" record={{ phone: "+14155552671" }}>
    <PhoneInput source="phone" label={false} />
  </StoryAdmin>
);
