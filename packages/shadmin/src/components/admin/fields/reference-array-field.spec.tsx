import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  WithDataTable,
} from "@/components/admin/fields/reference-array-field.stories";

describe("<ReferenceArrayField />", () => {
  it("renders a list of referenced records", async () => {
    const screen = render(<Basic />);
    // SingleFieldList renders chips/links once the references resolve.
    await expect
      .poll(() => screen.getByRole("link").all().length, { timeout: 5000 })
      .toBeGreaterThan(0);
  });

  it("can render its children as a DataTable of referenced records", async () => {
    const screen = render(<WithDataTable />);
    await expect
      .poll(() => screen.getByRole("row").all().length, { timeout: 5000 })
      .toBeGreaterThan(1);
  });
});
