import { StoryAdmin } from "@/test/_test-helpers";
import { RatingInput } from "@/components/admin";

export default {
  title: "Data Edition/RatingInput",
};

export const Basic = () => (
  <StoryAdmin mode="form" record={{ rating: 3 }}>
    <RatingInput source="rating" />
  </StoryAdmin>
);

export const HalfStep = () => (
  <StoryAdmin mode="form" record={{ rating: 2.5 }}>
    <RatingInput source="rating" allowHalf />
  </StoryAdmin>
);

export const Max10 = () => (
  <StoryAdmin mode="form" record={{ rating: 7 }}>
    <RatingInput source="rating" max={10} />
  </StoryAdmin>
);

export const Disabled = () => (
  <StoryAdmin mode="form" record={{ rating: 3 }}>
    <RatingInput source="rating" disabled />
  </StoryAdmin>
);

export const NoLabel = () => (
  <StoryAdmin mode="form" record={{ rating: 4 }}>
    <RatingInput source="rating" label={false} />
  </StoryAdmin>
);
