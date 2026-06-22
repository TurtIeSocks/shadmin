import { StoryAdmin } from "@/test/_test-helpers";
import { PhoneField } from "@/components/admin";

export default { title: "Data Display/PhoneField" };

export const Basic = () => (
  <StoryAdmin record={{ phone: "+14155552671" }}>
    <PhoneField source="phone" />
  </StoryAdmin>
);

export const International = () => (
  <StoryAdmin record={{ phone: "+442071234567" }}>
    <PhoneField source="phone" displayFormat="international" />
  </StoryAdmin>
);

export const NoLink = () => (
  <StoryAdmin record={{ phone: "+14155552671" }}>
    <PhoneField source="phone" link={false} />
  </StoryAdmin>
);

export const Empty = () => (
  <StoryAdmin record={{ phone: null }}>
    <PhoneField source="phone" empty="—" />
  </StoryAdmin>
);

export const Unparseable = () => (
  <StoryAdmin record={{ phone: "not-a-number" }}>
    <PhoneField source="phone" />
  </StoryAdmin>
);
