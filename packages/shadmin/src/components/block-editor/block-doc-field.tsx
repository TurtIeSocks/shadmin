import type { JSONContent } from "@tiptap/react";
import get from "lodash/get";
import { useRecordContext } from "ra-core";

import type { UnknownRecord } from "@/lib/unknown-types";

import { BlockEditor } from "./block-editor";
import { defaultBlocks } from "./blocks";
import type { BlockDefinition } from "./define-block";

export interface BlockDocFieldProps<
  RecordType extends UnknownRecord = UnknownRecord,
> {
  source: string;
  record?: RecordType;
  blocks?: BlockDefinition[];
  className?: string;
}

/**
 * Read-mode renderer for a block document. Reads TipTap JSON from the record at
 * `source` and renders it via a non-editable {@link BlockEditor}. Renders
 * nothing when the value is null or undefined.
 */
export function BlockDocField<
  RecordType extends UnknownRecord = UnknownRecord,
>({
  source,
  record: recordProp,
  blocks = defaultBlocks,
  className,
}: BlockDocFieldProps<RecordType>) {
  const recordFromContext = useRecordContext<RecordType>();
  const record = recordProp ?? recordFromContext;
  const value = record
    ? (get(record, source) as JSONContent | null | undefined)
    : undefined;

  if (value == null) return null;

  return (
    <BlockEditor
      value={value}
      blocks={blocks}
      editable={false}
      className={className}
    />
  );
}
