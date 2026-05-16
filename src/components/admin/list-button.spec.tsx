import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Default } from "@/stories/admin/list-button.stories";

describe("<ListButton />", () => {
  it("renders the Default story", () => {
    render(<Default />);

    expect(true).toBe(true);
  });
});
