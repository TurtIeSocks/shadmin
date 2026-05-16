import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/admin/count.stories";

describe("<Count />", () => {
  it("renders the Basic story", () => {
    render(<Basic />);

    expect(true).toBe(true);
  });
});
