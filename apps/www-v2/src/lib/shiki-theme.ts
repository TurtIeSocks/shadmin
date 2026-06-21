/**
 * Shared react-shiki dual-theme for all code blocks (docs ComponentPreview +
 * gallery ExampleFrame), so the two never drift. VS Code's default Light+/Dark+
 * palette — teal components, orange strings, light-blue attributes.
 *
 * Paired with the `.dark .shiki` color swap in index.css, which activates the
 * `--shiki-dark` token vars under the `.dark` class.
 */
export const SHIKI_THEME = { light: "one-light", dark: "dark-plus" } as const;
