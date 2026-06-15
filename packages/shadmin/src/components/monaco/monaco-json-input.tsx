import { lazy, Suspense } from "react";
import { MonacoSkeleton } from "./internal/monaco-skeleton";
import type { MonacoJsonInputProps } from "./internal/types";

const LazyInner = lazy(() =>
  import("./monaco-json-input-lazy").then((m) => ({
    default: m.MonacoJsonInputInner,
  })),
);

/**
 * Form input for JSON values, powered by the Monaco editor. Supports
 * JSON Schema validation, auto-completion, error markers, and auto-grow.
 *
 * Auto-detects whether `field.value` is a string or an object and
 * round-trips the same shape on change.
 *
 * Monaco is lazy-loaded — first mount shows a skeleton while the
 * chunk loads, subsequent mounts are instant.
 *
 * @see {@link https://shadmin.turtlesocks.dev/docs/monaco-json-input MonacoJsonInput documentation}
 *
 * @example
 * import { Edit, SimpleForm } from '@/components/admin';
 * import { MonacoJsonInput } from '@/components/monaco';
 *
 * const ProductEdit = () => (
 *   <Edit>
 *     <SimpleForm>
 *       <MonacoJsonInput source="metadata" schema={{
 *         type: "object",
 *         properties: { sku: { type: "string" } },
 *         required: ["sku"],
 *       }} />
 *     </SimpleForm>
 *   </Edit>
 * );
 */
function MonacoJsonInput(props: MonacoJsonInputProps) {
  return (
    <Suspense
      fallback={
        <MonacoSkeleton
          height={
            props.autoHeight ? (props.minHeight ?? 120) : (props.height ?? 300)
          }
        />
      }
    >
      <LazyInner {...props} />
    </Suspense>
  );
}

export { MonacoJsonInput, type MonacoJsonInputProps };
