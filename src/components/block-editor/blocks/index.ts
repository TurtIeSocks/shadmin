import type { BlockDefinition } from "../define-block";
import { calloutBlock } from "./callout";
import { toggleBlock } from "./toggle";

/** Batteries-included content blocks (no ra-core data dependency). */
export const defaultBlocks: BlockDefinition[] = [calloutBlock, toggleBlock];

export { calloutBlock, toggleBlock };
