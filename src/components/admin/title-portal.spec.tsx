import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Empty } from "@/stories/admin/title-portal.stories";

describe("<TitlePortal />", () => {
  it("renders the Empty story", () => {
    render(<Empty />);

    expect(true).toBe(true);
  });
});
