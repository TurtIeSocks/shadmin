import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/admin/filter-list-item.stories";

describe("<FilterListItem />", () => {
  it("renders the Basic story", () => {
    render(<Basic />);

    expect(true).toBe(true);
  });
});
