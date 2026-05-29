import type { BlockDefinition } from "../define-block";
import { calloutBlock } from "./callout";
import { toggleBlock } from "./toggle";
import { imageBlock } from "./image";

/** Batteries-included content/media blocks (no ra-core data dependency). */
export const defaultBlocks: BlockDefinition[] = [calloutBlock, toggleBlock, imageBlock];

export { calloutBlock, toggleBlock, imageBlock };
