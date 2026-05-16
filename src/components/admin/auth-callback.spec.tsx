import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Loading, ErrorState } from "@/stories/admin/auth-callback.stories";

describe("<AuthCallback />", () => {
  it("renders the loading state while the callback is pending", async () => {
    const screen = render(<Loading />);
    await expect
      .element(screen.getByRole("status").first())
      .toBeInTheDocument();
  });

  it("renders the auth-error screen when handleCallback rejects", async () => {
    const screen = render(<ErrorState />);
    await expect.element(screen.getByRole("alert")).toBeInTheDocument();
  });
});
