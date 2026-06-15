import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "./filter-live-form.stories";

describe("<FilterLiveForm />", () => {
  it("renders the live filter inputs alongside the data table", async () => {
    const screen = render(<Basic />);
    // The sidebar exposes two filter inputs; each input gets the source as its
    // accessible label.
    await expect.element(screen.getByLabelText(/title/i)).toBeInTheDocument();
    await expect.element(screen.getByLabelText(/author/i)).toBeInTheDocument();
  });
});
