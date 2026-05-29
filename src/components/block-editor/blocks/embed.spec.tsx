import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { toEmbedSrc } from "@/components/block-editor/blocks/embed";
import { EmbedStory, EmbedUnsupportedStory } from "@/stories/block-editor/blocks-2.stories";

describe("toEmbedSrc (allowlist parser)", () => {
  it("maps YouTube watch + short URLs to the nocookie embed URL", () => {
    expect(toEmbedSrc("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
    expect(toEmbedSrc("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
  });
  it("maps Vimeo to the player URL", () => {
    expect(toEmbedSrc("https://vimeo.com/123456789")).toBe(
      "https://player.vimeo.com/video/123456789",
    );
  });
  it("rejects non-allowlisted / injection-y URLs", () => {
    expect(toEmbedSrc("javascript:alert(1)")).toBeNull();
    expect(toEmbedSrc("https://evil.com/embed/x")).toBeNull();
    expect(toEmbedSrc("https://www.youtube.com/watch?v=../../x")).toBeNull();
  });
});

describe("embed block", () => {
  it("renders an iframe with the safe constructed src for YouTube", async () => {
    const screen = render(<EmbedStory />);
    const iframe = screen.container.querySelector('[data-block="embed"] iframe') as HTMLIFrameElement;
    expect(iframe).not.toBeNull();
    expect(iframe.getAttribute("src")).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });
  it("renders a placeholder (no iframe) for unsupported URLs", async () => {
    const screen = render(<EmbedUnsupportedStory />);
    expect(screen.container.querySelector('[data-block="embed"] iframe')).toBeNull();
    await expect
      .element(screen.container.querySelector('[data-block="embed"]') as HTMLElement)
      .toHaveTextContent(/youtube or vimeo/i);
  });
});
