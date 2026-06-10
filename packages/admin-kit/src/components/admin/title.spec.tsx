import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  TranslatedTitle,
  ReactElementTitle,
} from "./title.stories";

describe("<Title />", () => {
  it("renders the title text inside the portal", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("heading", { name: "Hello world" }))
      .toBeInTheDocument();
  });

  it("translates an i18n key passed as title", async () => {
    const screen = render(<TranslatedTitle />);
    await expect
      .element(screen.getByRole("heading", { name: "Dashboard" }))
      .toBeInTheDocument();
  });

  it("renders a React element title as-is", async () => {
    const screen = render(<ReactElementTitle />);
    await expect.element(screen.getByText("world!")).toBeInTheDocument();
  });
});
