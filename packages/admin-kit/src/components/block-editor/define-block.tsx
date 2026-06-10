import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import type { z } from "zod";

export interface BlockRenderProps<
  A extends Record<string, unknown> = Record<string, unknown>,
> {
  attrs: A;
  mode: "edit" | "read";
  selected?: boolean;
  updateAttrs?: (patch: Partial<A>) => void;
}

export interface BlockConfigProps<
  A extends Record<string, unknown> = Record<string, unknown>,
> {
  attrs: A;
  onChange: (patch: Partial<A>) => void;
}

/**
 * Author-facing block definition — precisely typed in `A` so `render`/`config`
 * receive correctly-typed attrs. Passed to {@link defineBlock}.
 */
export interface BlockDefinitionInput<
  A extends Record<string, unknown> = Record<string, unknown>,
> {
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

/**
 * Erased, collection-friendly block type. Arrays (`blocks` prop, `defaultBlocks`),
 * the registry, and the node factory all use this. `defineBlock` erases the `A`
 * generic on return so heterogeneous blocks collect into `BlockDefinition[]`
 * without variance errors (`A` is contravariant via `render`/`config`).
 */
export type BlockDefinition = BlockDefinitionInput<Record<string, unknown>>;

/**
 * Define a block. `A` is inferred from the schema so `render`/`config` are
 * type-checked against the precise attrs, while the returned value is the erased
 * {@link BlockDefinition} for safe collection into arrays.
 */
export function defineBlock<A extends Record<string, unknown>>(
  def: BlockDefinitionInput<A>,
): BlockDefinition {
  return def as unknown as BlockDefinition;
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
