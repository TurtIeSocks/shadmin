import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/admin/wrapper-field.stories";

describe("<WrapperField />", () => {
  it("renders each child field's value", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("John")).toBeInTheDocument();
    await expect.element(screen.getByText("Doe")).toBeInTheDocument();
  });
});
