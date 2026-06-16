import assert from "node:assert/strict";

import { parseCssVars } from "./parse-css-vars.mjs";

const css = `
/* a comment */
:root { --primary: oklch(0.2 0 0); --radius: 0.5rem; }
.dark { --primary: oklch(0.9 0 0); }
.theme-aurora { --primary: rebeccapurple; }
.theme-aurora.dark { --primary: hotpink; }
@utility glass { background: var(--glass-bg); }
`;

assert.deepEqual(parseCssVars(css, ":root"), {
  primary: "oklch(0.2 0 0)",
  radius: "0.5rem",
});
assert.deepEqual(parseCssVars(css, ".dark"), { primary: "oklch(0.9 0 0)" });
assert.deepEqual(parseCssVars(css, ".theme-aurora"), {
  primary: "rebeccapurple",
});
assert.deepEqual(parseCssVars(css, ".theme-aurora.dark"), {
  primary: "hotpink",
});
// @utility block holds no custom-property declarations → empty
assert.deepEqual(parseCssVars(css, "@utility glass"), {});

console.log("parse-css-vars OK");
