import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { NoFilters } from "@/stories/list-no-results.stories";

describe("<ListNoResults />", () => {
  it("renders the NoFilters story", () => {
    render(<NoFilters />);

    expect(true).toBe(true);
  });
});
