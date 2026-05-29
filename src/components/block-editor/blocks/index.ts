import type { BlockDefinition } from "../define-block";
import { calloutBlock } from "./callout";

/** Batteries-included content blocks (no ra-core data dependency). */
export const defaultBlocks: BlockDefinition[] = [calloutBlock];

export { calloutBlock };
