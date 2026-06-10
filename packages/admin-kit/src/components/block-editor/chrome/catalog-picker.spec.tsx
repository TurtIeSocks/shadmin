import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { z } from "zod";
import { Lightbulb, Boxes } from "lucide-react";
import { defineBlock } from "../define-block";
import { createBlockRegistry } from "../block-registry";
import { CatalogPicker } from "./catalog-picker";

const registry = createBlockRegistry([
  defineBlock({
    name: "callout",
    label: "Callout",
    group: "content",
    icon: Lightbulb,
    schema: z.object({}),
    render: () => null,
  }),
  defineBlock({
    name: "referenceRecord",
    label: "Reference record",
    group: "data",
    icon: Boxes,
    schema: z.object({}),
    render: () => null,
  }),
]);

describe("<CatalogPicker />", () => {
  it("lists grouped blocks and fires onSelect with the chosen block", async () => {
    const onSelect = vi.fn();
    const screen = render(
      <CatalogPicker registry={registry} onSelect={onSelect} onClose={() => {}} />,
    );
    await expect
      .element(screen.getByText("Reference record"))
      .toBeInTheDocument();
    await screen.getByText("Reference record").click();
    expect(onSelect).toHaveBeenCalledWith("referenceRecord");
  });

  it("filters by search query", async () => {
    const screen = render(
      <CatalogPicker registry={registry} onSelect={() => {}} onClose={() => {}} />,
    );
    await screen.getByPlaceholder(/search blocks/i).fill("call");
    await expect.element(screen.getByText("Callout")).toBeInTheDocument();
    expect(screen.container.textContent).not.toContain("Reference record");
  });
});
