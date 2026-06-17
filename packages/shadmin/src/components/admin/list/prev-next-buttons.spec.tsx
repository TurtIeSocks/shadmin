import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Default,
  FirstRecord,
  LastRecord,
} from "@/components/admin/list/prev-next-buttons.stories";

describe("<PrevNextButtons />", () => {
  it("renders previous and next navigation when there is a record on each side", async () => {
    const screen = render(<Default />);
    await expect
      .poll(() => screen.getByRole("link", { name: /previous/i }).query(), {
        timeout: 2000,
      })
      .not.toBeNull();
    await expect
      .element(screen.getByRole("link", { name: /next/i }))
      .toBeInTheDocument();
  });

  it("disables the previous button when on the first record", async () => {
    const screen = render(<FirstRecord />);
    await expect
      .poll(
        () =>
          (
            screen
              .getByRole("button", { name: /previous/i })
              .element() as HTMLButtonElement | null
          )?.disabled,
        { timeout: 2000 },
      )
      .toBe(true);
  });

  it("disables the next button when on the last record", async () => {
    const screen = render(<LastRecord />);
    await expect
      .poll(
        () =>
          (
            screen
              .getByRole("button", { name: /next/i })
              .element() as HTMLButtonElement | null
          )?.disabled,
        { timeout: 2000 },
      )
      .toBe(true);
  });
});
