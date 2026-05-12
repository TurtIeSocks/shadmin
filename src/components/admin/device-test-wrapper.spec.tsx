import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/device-test-wrapper.stories";

describe("<DeviceTestWrapper />", () => {
  it("renders the Basic story", () => {
    render(<Basic theme="system" width="md" />);

    expect(true).toBe(true);
  });
});
