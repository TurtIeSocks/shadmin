import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Currency,
  Percent,
  Empty,
} from "@/components/admin/fields/number-field.stories";

describe("<NumberField />", () => {
  it("renders a number formatted with the default locale", async () => {
    const screen = render(<Basic />);
    // 1234567 formats to "1,234,567" in en-US
    await expect.element(screen.getByText("1,234,567")).toBeInTheDocument();
  });

  it("renders a number formatted as a currency", async () => {
    const screen = render(<Currency />);
    await expect.element(screen.getByText("$49.95")).toBeInTheDocument();
  });

  it("renders a number formatted as a percent", async () => {
    const screen = render(<Percent />);
    await expect.element(screen.getByText("42%")).toBeInTheDocument();
  });

  it("renders the empty placeholder when value is missing", async () => {
    const screen = render(<Empty />);
    await expect.element(screen.getByText("—")).toBeInTheDocument();
  });
});
