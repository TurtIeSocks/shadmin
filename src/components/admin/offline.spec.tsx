import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/offline.stories";

describe("<Offline />", () => {
  it("renders the Basic story", () => {
    render(<Basic online={false} />);

    expect(true).toBe(true);
  });
});
