import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Placeholder } from "@/components/admin/placeholder";
import { Basic } from "@/stories/admin/placeholder.stories";

describe("<Placeholder />", () => {
  it("renders the placeholder span with the custom className", async () => {
    const screen = render(
      <Placeholder className="w-24 placeholder-test-marker" />,
    );
    const node = document.querySelector(".placeholder-test-marker");
    expect(node).not.toBeNull();
    void screen;
  });

  it("renders the Basic story", async () => {
    const screen = render(<Basic theme="system" />);
    const node = screen.container.querySelector("span");
    expect(node).not.toBeNull();
  });
});
