import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/extras/in-place-editor.stories";

describe("<InPlaceEditor />", () => {
  it("renders the record value in the reading state", async () => {
    const screen = render(<Basic />);
    // The Basic story seeds the record { title: "Extras/InPlaceEditor" }
    // and binds InPlaceEditor to `source="title"`, so its initial reading
    // state must surface that exact text.
    await expect
      .element(screen.getByText("Extras/InPlaceEditor"))
      .toBeInTheDocument();
  });
});
