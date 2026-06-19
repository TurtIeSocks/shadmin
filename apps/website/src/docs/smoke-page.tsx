/**
 * SMOKE TEST ROUTE — to be removed after controller verification.
 * Route: /docs/_smoke
 */
import SmokeMdx from "./content/_smoke.mdx";

export function SmokePage() {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none p-6">
      <SmokeMdx />
    </article>
  );
}
