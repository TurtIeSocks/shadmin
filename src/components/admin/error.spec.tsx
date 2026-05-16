import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/admin/error.stories";

describe("<Error />", () => {
  it("renders the Basic story", () => {
    render(<Basic theme="system" />);

    expect(true).toBe(true);
  });
});
