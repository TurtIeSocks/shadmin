import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Composite,
  Empty,
  Eur,
  MinorUnits,
} from "@/stories/admin/currency-field.stories";

describe("<CurrencyField />", () => {
  it("formats a number with USD by default", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("$1,234.50")).toBeInTheDocument();
  });

  it("formats with EUR + de-DE locale", async () => {
    const screen = render(<Eur />);
    await expect.element(screen.getByText(/999,99/)).toBeInTheDocument();
  });

  it("divides by 100 when storeAsMinorUnits=true", async () => {
    const screen = render(<MinorUnits />);
    await expect.element(screen.getByText("$123.45")).toBeInTheDocument();
  });

  it("reads currency from the composite object shape", async () => {
    const screen = render(<Composite />);
    await expect.element(screen.getByText(/¥/)).toBeInTheDocument();
  });

  it("renders empty fallback when value is null", async () => {
    const screen = render(<Empty />);
    await expect.element(screen.getByText("—")).toBeInTheDocument();
  });
});
