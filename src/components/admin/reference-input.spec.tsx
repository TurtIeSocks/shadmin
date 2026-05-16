import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/admin/reference-input.stories";

describe("<ReferenceInput />", () => {
  it("renders the Basic story", () => {
    render(<Basic />);

    expect(true).toBe(true);
  });
});
