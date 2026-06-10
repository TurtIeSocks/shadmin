import { StoryAdmin } from "@/test/_test-helpers";
import { RatingField } from "@/components/extras";

export default {
  title: "Data Display/RatingField",
};

export const Basic = () => (
  <StoryAdmin record={{ rating: 3 }}>
    <RatingField source="rating" />
  </StoryAdmin>
);

export const Half = () => (
  <StoryAdmin record={{ rating: 2.5 }}>
    <RatingField source="rating" allowHalf />
  </StoryAdmin>
);

export const MaxTen = () => (
  <StoryAdmin record={{ rating: 7 }}>
    <RatingField source="rating" max={10} />
  </StoryAdmin>
);

export const WithCount = () => (
  <StoryAdmin record={{ rating: 4, ratingCount: 128 }}>
    <RatingField source="rating" countSource="ratingCount" />
  </StoryAdmin>
);

export const Empty = () => (
  <StoryAdmin record={{ rating: null }}>
    <RatingField source="rating" empty="—" />
  </StoryAdmin>
);
