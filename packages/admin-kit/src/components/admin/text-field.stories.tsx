import { StoryAdmin } from "@/test/_test-helpers";
import { TextField } from "@/components/admin";

export default { title: "Data Display/TextField" };

const record = {
  id: 1,
  name: "Lao Tzu",
  bio: "Ancient Chinese philosopher and writer",
};

export const Basic = () => (
  <StoryAdmin record={record}>
    <TextField source="name" />
  </StoryAdmin>
);

export const Multiline = () => (
  <StoryAdmin record={record}>
    <TextField source="bio" />
  </StoryAdmin>
);

export const Empty = () => (
  <StoryAdmin record={{ id: 1, name: "Lao Tzu" }}>
    <TextField source="bio" empty="No biography available" />
  </StoryAdmin>
);

export const NullWithoutEmpty = () => (
  <StoryAdmin record={{ id: 1 }}>
    <TextField source="name" />
  </StoryAdmin>
);
