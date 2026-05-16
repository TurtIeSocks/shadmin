import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/admin/loading.stories";

describe("<Loading />", () => {
  it("renders the loading status region after the delay elapses", async () => {
    const screen = render(<Basic theme="system" delay={0} />);
    await expect
      .element(screen.getByRole("status").first())
      .toBeInTheDocument();
    await expect
      .element(screen.getByText(/loading/i).first())
      .toBeInTheDocument();
  });
});
