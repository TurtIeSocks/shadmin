import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  WithChildren,
  WithRenderProp,
} from "@/components/admin/list/single-field-list.stories";

describe("<SingleFieldList />", () => {
  it("renders the default record representation for each item", async () => {
    const screen = render(<Basic />);
    // 4 tag records with no recordRepresentation set; default uses the `name`
    // field — assert the first and last are visible.
    await expect.element(screen.getByText("React")).toBeInTheDocument();
    await expect.element(screen.getByText("Vite")).toBeInTheDocument();
  });

  it("renders the supplied child field for each record", async () => {
    const screen = render(<WithChildren />);
    await expect.element(screen.getByText("React")).toBeInTheDocument();
    await expect.element(screen.getByText("TypeScript")).toBeInTheDocument();
    await expect.element(screen.getByText("Vite")).toBeInTheDocument();
  });

  it("invokes the render prop for each record", async () => {
    const screen = render(<WithRenderProp />);
    await expect.element(screen.getByText("React")).toBeInTheDocument();
    await expect.element(screen.getByText("Storybook")).toBeInTheDocument();
  });
});
