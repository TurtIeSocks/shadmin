import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Default } from "@/stories/admin/bulk-update-button.stories";

describe("<BulkUpdateButton />", () => {
  it("renders the Default story", () => {
    render(<Default />);

    expect(true).toBe(true);
  });
});
