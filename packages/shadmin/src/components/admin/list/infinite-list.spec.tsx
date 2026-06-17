import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  WithSimpleList,
} from "@/components/admin/list/infinite-list.stories";

describe("<InfiniteList />", () => {
  it("renders the first page of records", async () => {
    const screen = render(<Basic />);
    await expect
      .poll(() => screen.getByRole("row").all().length, { timeout: 5000 })
      .toBeGreaterThan(0);
  });

  it("supports a custom child renderer via <SimpleList>", async () => {
    const screen = render(<WithSimpleList />);
    await expect
      .poll(() => screen.getByRole("listitem").all().length, { timeout: 5000 })
      .toBeGreaterThan(0);
  });
});
