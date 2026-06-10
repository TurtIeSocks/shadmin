import { StoryAdmin } from "@/test/_test-helpers";
import { StatusTransitionButton } from "@/components/extras";

export default { title: "Extras/StatusTransitionButton" };

const TRANSITIONS = {
  draft: ["review", "archived"],
  review: ["published", "draft"],
  published: ["archived"],
  archived: [],
};

export const Basic = () => (
  <StoryAdmin record={{ id: 1, title: "Post", status: "draft" }}>
    <StatusTransitionButton source="status" transitions={TRANSITIONS} />
  </StoryAdmin>
);

export const Published = () => (
  <StoryAdmin record={{ id: 1, title: "Post", status: "published" }}>
    <StatusTransitionButton source="status" transitions={TRANSITIONS} />
  </StoryAdmin>
);

export const TerminalState = () => (
  <StoryAdmin record={{ id: 1, title: "Post", status: "archived" }}>
    <StatusTransitionButton source="status" transitions={TRANSITIONS} />
  </StoryAdmin>
);

export const WithGuard = () => (
  <StoryAdmin
    record={{ id: 1, title: "Post", status: "review", missingFields: true }}
  >
    <StatusTransitionButton
      source="status"
      transitions={TRANSITIONS}
      guards={{
        "review->published": (r) => !r.missingFields,
      }}
    />
  </StoryAdmin>
);
