import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/admin/translatable-fields.stories";

describe("<TranslatableFields />", () => {
  it("renders the Basic story", () => {
    render(<Basic theme="system" />);

    expect(true).toBe(true);
  });
});
