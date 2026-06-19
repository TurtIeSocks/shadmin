import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { transformContent } from "./port-content.mjs";

describe("transformContent", () => {
  test("fence-awareness: class= inside fence stays; outside becomes className", () => {
    const raw = `---
title: Test
---

<div class="outside">text</div>

\`\`\`jsx
<div class="inside">code</div>
\`\`\`

<span class="also-outside">more</span>
`;
    const result = transformContent(raw, "test");
    // Outside fences: class= → className=
    assert.ok(
      result.includes('<div className="outside">'),
      "outside class= not converted",
    );
    assert.ok(
      result.includes('<span className="also-outside">'),
      "span outside class= not converted",
    );
    // Inside fences: class= unchanged
    assert.ok(
      result.includes('<div class="inside">'),
      "inside fence class= was incorrectly changed",
    );
  });

  test("import stripping: PropsTable.astro import removed; PropsTable usage survives", () => {
    const raw = `---
title: Test
---

import PropsTable from "../../components/props-table.astro";

Some text.

<PropsTable name="MyComponent"/>
`;
    const result = transformContent(raw, "test");
    assert.ok(
      !result.includes(
        'import PropsTable from "../../components/props-table.astro"',
      ),
      "astro import not stripped",
    );
    assert.ok(
      result.includes('<PropsTable name="MyComponent"/>'),
      "PropsTable JSX usage was incorrectly removed",
    );
  });

  test("asset-import inlining: import + {v} → literal path; import line removed", () => {
    const raw = `---
title: Test
---

import video from './images/date-input.mp4';

<video controls>
    <source src={video} type="video/mp4" />
</video>
`;
    const result = transformContent(raw, "test");
    assert.ok(
      !result.includes("import video from './images/date-input.mp4'"),
      "asset import line not removed",
    );
    assert.ok(
      result.includes('src="/docs/images/date-input.mp4"'),
      "asset import not inlined as path",
    );
    assert.ok(!result.includes("{video}"), "{video} reference not replaced");
  });

  test("asset path rewrite: ./images/ → /docs/images/ in markdown links and src attrs", () => {
    const raw = `---
title: Test
---

![alt text](./images/screenshot.png)

<img src="./images/logo.svg" alt="logo" />
<img src='./images/banner.png' alt="banner" />
`;
    const result = transformContent(raw, "test");
    assert.ok(
      result.includes("](/docs/images/screenshot.png)"),
      "markdown image link not rewritten",
    );
    assert.ok(
      result.includes('src="/docs/images/logo.svg"'),
      "double-quote src not rewritten",
    );
    assert.ok(
      result.includes("src='/docs/images/banner.png'"),
      "single-quote src not rewritten",
    );
  });

  test("attr normalization: all attrs converted correctly on HTML lines", () => {
    const raw = `---
title: Test
---

<div class="x" for="y">
<video autoplay playsinline>
<iframe frameborder="0" allowfullscreen>
<img srcset="a.png 1x" tabindex="0">
<td colspan="2" rowspan="3">
`;
    const result = transformContent(raw, "test");
    assert.ok(result.includes('className="x"'), "class= not → className=");
    assert.ok(result.includes('htmlFor="y"'), "for= not → htmlFor=");
    assert.ok(result.includes("autoPlay"), "autoplay not → autoPlay");
    assert.ok(result.includes("playsInline"), "playsinline not → playsInline");
    assert.ok(
      result.includes('frameBorder="0"'),
      "frameborder not → frameBorder",
    );
    assert.ok(
      result.includes("allowFullScreen"),
      "allowfullscreen not → allowFullScreen",
    );
    assert.ok(result.includes('srcSet="a.png 1x"'), "srcset not → srcSet");
    assert.ok(result.includes('tabIndex="0"'), "tabindex not → tabIndex");
    assert.ok(result.includes('colSpan="2"'), "colspan not → colSpan");
    assert.ok(result.includes('rowSpan="3"'), "rowspan not → rowSpan");
  });

  test("autolinks: <url> and <email> → MDX-safe links; fenced ones untouched", () => {
    const raw = `---
title: Test
---

See <https://ui.shadcn.com/docs/installation/vite> for setup.

Mail <hi@example.com> for help.

\`\`\`html
<https://keep-me-fenced.com>
\`\`\`
`;
    const result = transformContent(raw, "test");
    assert.ok(
      result.includes(
        "[https://ui.shadcn.com/docs/installation/vite](https://ui.shadcn.com/docs/installation/vite)",
      ),
      "url autolink not converted",
    );
    assert.ok(
      result.includes("[hi@example.com](mailto:hi@example.com)"),
      "email autolink not converted",
    );
    assert.ok(
      result.includes("<https://keep-me-fenced.com>"),
      "fenced autolink was incorrectly converted",
    );
  });

  test("brace escaping: prose {expr} escaped; inline code + fenced left alone", () => {
    const raw = `---
title: Test
---

They return { data, isPending, error } on mount.

The key is \`%{provider}\` but plain %{provider} must escape.

Inline \`{ ok: true }\` stays.

\`\`\`ts
const x = { y: 1 };
\`\`\`
`;
    const result = transformContent(raw, "test");
    // prose braces escaped
    assert.ok(
      result.includes("\\{ data, isPending, error \\}"),
      "prose object braces not escaped",
    );
    assert.ok(
      result.includes("plain %\\{provider\\}"),
      "prose %{provider} not escaped",
    );
    // inline code preserved
    assert.ok(
      result.includes("`%{provider}`"),
      "inline-code braces were wrongly escaped",
    );
    assert.ok(
      result.includes("`{ ok: true }`"),
      "inline-code object braces were wrongly escaped",
    );
    // fenced code preserved
    assert.ok(
      result.includes("const x = { y: 1 };"),
      "fenced braces were wrongly escaped",
    );
  });

  test("idempotency: running transformContent twice equals once", () => {
    const raw = `---
title: Test
---

<div class="container" for="field">
<video autoplay playsinline>

![img](./images/test.png)

<img src="./images/logo.svg" />

import PropsTable from "../../components/props-table.astro";

<PropsTable name="Foo"/>
`;
    const once = transformContent(raw, "test");
    const twice = transformContent(once, "test");
    assert.strictEqual(once, twice, "transform is not idempotent");
  });

  test("fence-awareness: indented fences are respected", () => {
    const raw = `---
title: Test
---

  \`\`\`html
  <div class="inside-indented">fenced</div>
  \`\`\`

<div class="outside">outside</div>
`;
    const result = transformContent(raw, "test");
    assert.ok(
      result.includes('<div class="inside-indented">'),
      "indented fence class= was incorrectly changed",
    );
    assert.ok(
      result.includes('<div className="outside">'),
      "outside class= not converted after indented fence",
    );
  });
});
