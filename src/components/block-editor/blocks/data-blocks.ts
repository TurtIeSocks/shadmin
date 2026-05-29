import type { BlockDefinition } from "../define-block";
import { referenceRecordBlock } from "./reference-record";
import { recordListBlock } from "./record-list";
import { chartBlock } from "./chart";

/**
 * ra-core data blocks. Opt in explicitly via the editor's `blocks` prop, e.g.
 * `blocks={[...defaultBlocks, ...dataBlocks]}`.
 */
export const dataBlocks: BlockDefinition[] = [
  referenceRecordBlock,
  recordListBlock,
  chartBlock,
];

export { referenceRecordBlock, recordListBlock, chartBlock };
