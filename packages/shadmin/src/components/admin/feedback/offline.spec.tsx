import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  CustomChildren,
} from "@/components/admin/feedback/offline.stories";

describe("<Offline />", () => {
  it("renders the offline banner when navigator is offline", async () => {
    const screen = render(<Basic online={false} />);
    await expect.element(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders nothing when navigator is online", async () => {
    const screen = render(<Basic online={true} />);
    await expect.element(screen.getByRole("status")).not.toBeInTheDocument();
  });

  it("renders custom offline children when provided", async () => {
    const screen = render(<CustomChildren online={false} />);
    await expect
      .element(screen.getByText(/working from cache/i))
      .toBeInTheDocument();
  });
});
