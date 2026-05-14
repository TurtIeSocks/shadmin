---
title: "RichTextField"
---

Renders an HTML string as rich text. The HTML is sanitized with [DOMPurify](https://github.com/cure53/DOMPurify) and parsed into a React element tree with [`html-react-parser`](https://github.com/remarkablemark/html-react-parser). This means no React HTML-injection escape hatch is used, and the field is safe from Cross-Site Scripting (XSS) attacks.

Even though the rendering path is safe, it is still good practice to sanitize the content on the server as defense-in-depth.

## Usage

```tsx
import { RichTextField } from "@/components/admin";

<RichTextField source="body" />;
```

To render the value as plain text with all markup removed, pass `stripTags`:

```tsx
<RichTextField source="body" stripTags />
```

## Props

| Prop            | Required | Type            | Default             | Description                             |
| --------------- | -------- | --------------- | ------------------- | --------------------------------------- |
| `source`        | Required | `string`        | -                   | Field containing the HTML               |
| `record`        | Optional | `object`        | Record from context | Explicit record                         |
| `defaultValue`  | Optional | `any`           | -                   | Fallback value                          |
| `empty`         | Optional | `ReactNode`     | -                   | Placeholder when value is null or empty |
| `stripTags`     | Optional | `boolean`       | `false`             | Strip all HTML and render plain text    |
| `purifyOptions` | Optional | `PurifyOptions` | `{}`                | Options passed to DOMPurify             |
| `className`     | Optional | `string`        | -                   | Additional CSS classes                  |

Remaining props are forwarded to the wrapping `<span>`.

## `source`

Name of the field containing the HTML string.

```tsx
<RichTextField source="body" />
```

## `stripTags`

When `true`, all HTML markup is removed and only the plain text is rendered.

```tsx
<RichTextField source="body" stripTags />
```

## `purifyOptions`

Options forwarded to DOMPurify's `sanitize` call to tighten or loosen the allow-list of tags and attributes.

```tsx
<RichTextField
  source="body"
  purifyOptions={{
    ALLOWED_TAGS: ["p", "strong", "em", "a"],
    ALLOWED_ATTR: ["href"],
  }}
/>
```

## `empty`

Rendered when the field value is `null`, `undefined`, or an empty string. Strings are passed through the translator.

```tsx
<RichTextField source="body" empty="No description" />
```
