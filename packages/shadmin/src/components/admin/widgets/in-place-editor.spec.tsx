import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "./in-place-editor.stories";

describe("<InPlaceEditor />", () => {
  it("renders the record value in the reading state", async () => {
    const screen = render(<Basic />);
    // The Basic story binds InPlaceEditor to `source="title"`, so its initial
    // reading state must surface the record's title.
    await expect.element(screen.getByText("Hello world")).toBeInTheDocument();
  });
});
