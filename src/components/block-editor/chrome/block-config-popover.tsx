import { createElement, type ComponentType } from "react";
import type { BlockDefinition, BlockConfigProps } from "../define-block";
import { AutoConfigForm } from "./auto-config-form";

export interface BlockConfigBodyProps {
  block: BlockDefinition;
  attrs: Record<string, unknown>;
  onChange: (patch: Record<string, unknown>) => void;
}

/**
 * Body of the config popover. Uses the block's custom `config` component when one
 * is provided; otherwise (omitted or `"auto"`) derives a form from the block's
 * Zod schema via {@link AutoConfigForm}.
 */
export function BlockConfigBody({ block, attrs, onChange }: BlockConfigBodyProps) {
  if (!block.config || block.config === "auto") {
    return (
      <AutoConfigForm schema={block.schema} attrs={attrs} onChange={onChange} />
    );
  }
  const Custom = block.config as ComponentType<BlockConfigProps>;
  return createElement(Custom, { attrs, onChange });
}
