import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Default } from "@/stories/prev-next-buttons.stories";

describe("<PrevNextButtons />", () => {
  it("renders the Default story", () => {
    render(<Default />);

    expect(true).toBe(true);
  });
});
