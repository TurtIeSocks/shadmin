import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Loading } from "@/stories/auth-callback.stories";

describe("<AuthCallback />", () => {
  it("renders the Loading story", () => {
    render(<Loading />);

    expect(true).toBe(true);
  });
});
