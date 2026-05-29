import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import type { z } from "zod";

export interface BlockRenderProps<A extends Record<string, unknown> = Record<string, unknown>> {
  attrs: A;
  mode: "edit" | "read";
  selected?: boolean;
  updateAttrs?: (patch: Partial<A>) => void;
}

export interface BlockConfigProps<A extends Record<string, unknown> = Record<string, unknown>> {
  attrs: A;
  onChange: (patch: Partial<A>) => void;
}

export interface BlockDefinition<A extends Record<string, unknown> = Record<string, unknown>> {
  /** Unique id — also the ProseMirror node name. */
  name: string;
  label: string;
  group: "content" | "media" | "layout" | "data" | (string & {});
  icon: LucideIcon;
  keywords?: string[];
  description?: string;
  /** Zod schema for attrs — drives defaults, node attributes, validation, config:"auto". */
  schema: z.ZodType<A>;
  /** Single render fn for edit + read mode. Data-blocks call ra-core hooks here. */
  render: ComponentType<BlockRenderProps<A>>;
  /** Editing-only override. Omit → default node-view chrome wraps `render`. */
  edit?: ComponentType<BlockRenderProps<A>>;
  /** Optional read-only renderer; falls back to `render`. */
  read?: ComponentType<BlockRenderProps<A>>;
  /** Popover config form. "auto" derives fields from schema; or a custom form. */
  config?: "auto" | ComponentType<BlockConfigProps<A>>;
  /** ProseMirror inner content (e.g. "block+"); omit = atom. */
  content?: string;
  /** Force atom; defaults to true when `content` is absent. */
  atom?: boolean;
}

/** Identity helper that pins generic inference from the schema. */
export function defineBlock<A extends Record<string, unknown>>(
  def: BlockDefinition<A>,
): BlockDefinition<A> {
  return def;
}

type ZodObjectLike = { shape: Record<string, z.ZodType> };

function getShape(schema: z.ZodType): Record<string, z.ZodType> {
  const shape = (schema as unknown as ZodObjectLike).shape;
  if (!shape) {
    throw new Error("block schema must be a z.object({...})");
  }
  return shape;
}

/** Top-level attribute keys of a block's schema. */
export function schemaKeys(schema: z.ZodType): string[] {
  return Object.keys(getShape(schema));
}

/**
 * Default attrs from a Zod object schema. Parses each field against `undefined`:
 * a `.default()` yields its default, an optional yields undefined, anything
 * required yields `null` (so the node still has the attribute key present).
 */
export function getDefaultAttrs<A extends Record<string, unknown>>(
  schema: z.ZodType<A>,
): A {
  const shape = getShape(schema);
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(shape)) {
    const parsed = shape[key].safeParse(undefined);
    out[key] = parsed.success ? (parsed.data ?? null) : null;
  }
  return out as A;
}
