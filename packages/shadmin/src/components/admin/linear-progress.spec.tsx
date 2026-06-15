import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { NoDelay } from "./linear-progress.stories";

describe("<LinearProgress />", () => {
  it("renders the progress bar immediately when timeout is 0", async () => {
    render(<NoDelay theme="system" />);
    // The progress bar uses a w-40 h-1 bar — assert the wrapping element shows
    // up. Its className includes "animate-pulse" once the timeout passes.
    await expect
      .poll(() => document.querySelector(".animate-pulse"))
      .not.toBeNull();
  });
});
