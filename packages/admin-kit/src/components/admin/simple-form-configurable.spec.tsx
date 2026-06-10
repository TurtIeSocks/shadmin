import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  WithOmit,
} from "./simple-form-configurable.stories";

describe("<SimpleFormConfigurable />", () => {
  it("renders every declared input plus the Save button", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByLabelText(/^title$/i)).toBeInTheDocument();
    await expect
      .element(screen.getByLabelText(/^author$/i))
      .toBeInTheDocument();
    await expect.element(screen.getByLabelText(/^body$/i)).toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /save/i }))
      .toBeInTheDocument();
  });

  it("hides inputs whose source is listed in the omit prop", async () => {
    const screen = render(<WithOmit />);
    // omit=["id"] → no Id input after the omit preference has been
    // propagated to the inputs preference (happens after a re-render).
    await expect
      .poll(() => screen.getByLabelText(/^id$/i).query() != null, {
        timeout: 2000,
      })
      .toBe(false);
    await expect.element(screen.getByLabelText(/^title$/i)).toBeInTheDocument();
  });
});
