import { RecordContextProvider } from "ra-core";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { RichTextField } from "./rich-text-field";
import { Basic } from "@/stories/admin/rich-text-field.stories";

describe("RichTextField", () => {
  it("renders the Basic story", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("world")).toBeInTheDocument();
  });


  it("renders sanitized HTML as React elements", async () => {
    const record = {
      id: 1,
      body: "<p>Hello <strong>world</strong></p>",
    };
    const screen = render(
      <RecordContextProvider value={record}>
        <RichTextField source="body" />
      </RecordContextProvider>,
    );

    await expect.element(screen.getByText("world")).toBeInTheDocument();
  });

  it("strips script tags from malicious HTML", async () => {
    const record = {
      id: 1,
      body: "<p>Safe</p><script>window.__pwned = true;</script>",
    };
    const screen = render(
      <RecordContextProvider value={record}>
        <RichTextField source="body" />
      </RecordContextProvider>,
    );

    await expect.element(screen.getByText("Safe")).toBeInTheDocument();
    // The container should not include the script content as text either
    // (DOMPurify removes script tags entirely)
    expect((window as Window & { __pwned?: unknown }).__pwned).toBeUndefined();
  });

  it("strips inline event handlers", async () => {
    const record = {
      id: 1,
      body: '<img src="x" onerror="window.__xss = true">',
    };
    render(
      <RecordContextProvider value={record}>
        <RichTextField source="body" />
      </RecordContextProvider>,
    );

    expect((window as Window & { __xss?: unknown }).__xss).toBeUndefined();
  });

  it("renders plain text when stripTags is set", async () => {
    const record = {
      id: 1,
      body: "<p>Hello <strong>world</strong></p>",
    };
    const screen = render(
      <RecordContextProvider value={record}>
        <RichTextField source="body" stripTags />
      </RecordContextProvider>,
    );

    await expect.element(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders empty placeholder for null/empty values", async () => {
    const record = { id: 1, body: null };
    const screen = render(
      <RecordContextProvider value={record}>
        <RichTextField source="body" empty="No content" />
      </RecordContextProvider>,
    );

    await expect.element(screen.getByText("No content")).toBeInTheDocument();
  });
});
