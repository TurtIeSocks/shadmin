import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/admin/select-input.stories";

describe("<SelectInput />", () => {
  it("renders a combobox trigger that opens the choice list", async () => {
    const screen = render(<Basic />);
    const combobox = screen.getByRole("combobox");
    await expect.element(combobox).toBeInTheDocument();
    await combobox.click();
    // At least one option should appear after opening.
    const options = screen.getByRole("option");
    expect(options.all().length).toBeGreaterThan(0);
  });
});
