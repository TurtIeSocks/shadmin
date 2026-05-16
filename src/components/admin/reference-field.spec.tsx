import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/admin/reference-field.stories";

describe("<ReferenceField />", () => {
  it("renders the Basic story", () => {
    render(<Basic />);

    expect(true).toBe(true);
  });
});
