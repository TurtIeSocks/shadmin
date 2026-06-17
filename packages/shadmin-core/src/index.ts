// shadmin-core — headless, type-safe, UI-agnostic admin logic.
//
// THE SEAM. Today this re-exports ra-core verbatim; the in-house, type-safe
// replacement lands here symbol-by-symbol. Everything in the shadmin registry
// imports admin logic from "shadmin-core", never "ra-core" directly (enforced
// by a Biome noRestrictedImports rule), so the eventual swap is a change here
// rather than a repo-wide hunt.
//
// `export *` re-exports every named value AND type from ra-core — verified
// against the codebase: all consumers use named / `import type` / re-export
// forms (no default or namespace imports), so this barrel is complete.
export * from "ra-core";
