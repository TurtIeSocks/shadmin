import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Formatted,
} from "@/components/admin/fields/function-field.stories";

describe("<FunctionField />", () => {
  it("renders the value returned by the render prop", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("supports rendering a formatted value", async () => {
    const screen = render(<Formatted />);
    await expect.element(screen.getByText("1,234 views")).toBeInTheDocument();
  });
});
