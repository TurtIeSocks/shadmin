import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Multiline,
  Empty,
  NullWithoutEmpty,
} from "@/stories/admin/text-field.stories";

describe("<TextField />", () => {
  it("renders the source value from the record", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("Lao Tzu")).toBeInTheDocument();
  });

  it("renders multi-word values verbatim", async () => {
    const screen = render(<Multiline />);
    await expect
      .element(screen.getByText("Ancient Chinese philosopher and writer"))
      .toBeInTheDocument();
  });

  it("renders the empty placeholder when the value is missing", async () => {
    const screen = render(<Empty />);
    await expect
      .element(screen.getByText("No biography available"))
      .toBeInTheDocument();
  });

  it("renders nothing when the value is missing and no empty prop is set", async () => {
    const screen = render(<NullWithoutEmpty />);
    await expect.element(screen.getByText("Lao Tzu")).not.toBeInTheDocument();
  });
});
