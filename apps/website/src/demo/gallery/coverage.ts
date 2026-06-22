/** Pure coverage radar — no Vite/browser dependencies. */
export function coverageReport(
  docSlugs: string[],
  exampleSlugs: string[],
): { covered: string[]; missing: string[] } {
  const have = new Set(exampleSlugs);
  return {
    covered: docSlugs.filter((s) => have.has(s)),
    missing: docSlugs.filter((s) => !have.has(s)),
  };
}
