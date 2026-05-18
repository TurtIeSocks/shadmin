import { lazy, Suspense } from "react";
import { MonacoSkeleton } from "./internal/monaco-skeleton";
import type { MonacoJsonFieldProps } from "./internal/types";

const LazyInner = lazy(() =>
  import("./monaco-json-field-lazy").then((m) => ({
    default: m.MonacoJsonFieldInner,
  })),
);

/**
 * Read-only Monaco viewer for JSON values. Use in Show/Edit detail
 * contexts. For List cells, use `<JsonField>` (no Monaco) instead.
 *
 * Monaco is lazy-loaded.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/monaco-json-field/ MonacoJsonField documentation}
 *
 * @example
 * import { Show, SimpleShowLayout } from '@/components/admin';
 * import { MonacoJsonField } from '@/components/monaco';
 *
 * const ProductShow = () => (
 *   <Show>
 *     <SimpleShowLayout>
 *       <MonacoJsonField source="metadata" />
 *     </SimpleShowLayout>
 *   </Show>
 * );
 */
function MonacoJsonField(props: MonacoJsonFieldProps) {
  return (
    <Suspense
      fallback={
        <MonacoSkeleton
          height={props.autoHeight === false ? (props.height ?? 200) : 120}
        />
      }
    >
      <LazyInner {...props} />
    </Suspense>
  );
}

export { MonacoJsonField, type MonacoJsonFieldProps };
