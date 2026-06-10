import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { z } from "zod";
import { Lightbulb } from "lucide-react";
import { ThemeProvider } from "@/components/admin";
import { defineBlock } from "../define-block";
import { AutoConfigForm } from "./auto-config-form";
import { BlockConfigBody } from "./block-config-popover";

const schema = z.object({
  variant: z.enum(["info", "warning", "success"]).default("info"),
  dense: z.boolean().default(false),
});

describe("<AutoConfigForm />", () => {
  it("renders a select for enums and a switch for booleans, emitting changes", async () => {
    const onChange = vi.fn();
    const screen = render(
      <ThemeProvider>
        <AutoConfigForm
          schema={schema}
          attrs={{ variant: "info", dense: false }}
          onChange={onChange}
        />
      </ThemeProvider>,
    );
    await expect.element(screen.getByText(/variant/i)).toBeInTheDocument();
    await screen.getByRole("switch", { name: /dense/i }).click();
    expect(onChange).toHaveBeenCalledWith({ dense: true });
  });

  it("renders a text input for string/number fields", async () => {
    const onChange = vi.fn();
    const stringSchema = z.object({ title: z.string().default("") });
    const screen = render(
      <ThemeProvider>
        <AutoConfigForm
          schema={stringSchema}
          attrs={{ title: "hi" }}
          onChange={onChange}
        />
      </ThemeProvider>,
    );
    const input = screen.getByLabelText(/title/i);
    await input.fill("bye");
    expect(onChange).toHaveBeenCalledWith({ title: "bye" });
  });
});

describe("<BlockConfigBody />", () => {
  it("falls back to the auto form when config is omitted", async () => {
    const block = defineBlock({
      name: "auto-block",
      label: "Auto",
      group: "content",
      icon: Lightbulb,
      schema,
      render: () => null,
    });
    const screen = render(
      <ThemeProvider>
        <BlockConfigBody
          block={block}
          attrs={{ variant: "info", dense: false }}
          onChange={() => {}}
        />
      </ThemeProvider>,
    );
    // Auto form renders the enum + boolean controls.
    await expect
      .element(screen.getByRole("switch", { name: /dense/i }))
      .toBeInTheDocument();
  });

  it("renders the block's custom config component when provided", async () => {
    const block = defineBlock({
      name: "custom-block",
      label: "Custom",
      group: "content",
      icon: Lightbulb,
      schema,
      config: ({ attrs }) => (
        <div data-testid="custom-config">custom:{String(attrs.variant)}</div>
      ),
      render: () => null,
    });
    const screen = render(
      <ThemeProvider>
        <BlockConfigBody
          block={block}
          attrs={{ variant: "warning", dense: false }}
          onChange={() => {}}
        />
      </ThemeProvider>,
    );
    await expect
      .element(screen.getByTestId("custom-config"))
      .toHaveTextContent("custom:warning");
  });
});
