---
title: "MdxField"
---

Use `<MdxField>` to display a markdown string from a record as read-only rich content. It is the read-side companion to [`<MdxInput>`](./mdx-input).

## Installation

`<MdxField>` is shipped together with `<MdxInput>` in the `mdx-editor` registry block:

```bash
npx shadcn@latest add https://marmelab.com/shadcn-admin-kit/r/mdx-editor.json
```

You must also import the MDXEditor stylesheet once in your app:

```tsx
import "@mdxeditor/editor/style.css";
```

## Usage

```tsx
import { Show, RecordField } from "@/components/admin";
import { MdxField } from "@/components/mdx-editor";
import "@mdxeditor/editor/style.css";

const PostShow = () => (
  <Show>
    <RecordField source="body">
      <MdxField source="body" />
    </RecordField>
  </Show>
);
```

## Props

| Prop        | Required | Type            | Default               | Description                                     |
| ----------- | -------- | --------------- | --------------------- | ----------------------------------------------- |
| `source`    | Required | `string`        | -                     | Field name                                      |
| `empty`     | Optional | `ReactNode`     | -                     | Content rendered when the source value is empty |
| `emptyText` | Optional | `string`        | -                     | Deprecated — use `empty` instead                |
| `plugins`   | Optional | `RealmPlugin[]` | `defaultFieldPlugins` | MDXEditor plugin list                           |
| `record`    | Optional | `Record`        | RecordContext         | The record to read from                         |

`<MdxField>` also accepts any other prop accepted by `MDXEditor` except `markdown`, `readOnly`, and `ref`.

## `empty`

Provide a fallback to display when the source value is missing or empty. A string is translated through the `i18nProvider`; a React element is rendered as-is.

```tsx
<MdxField source="body" empty="No content yet" />
```

## `plugins`

By default, `<MdxField>` uses `defaultFieldPlugins` — the same set as `<MdxInput>` minus the toolbar plugin. Pass `plugins` to customize:

```tsx
import { MdxField, defaultFieldPlugins } from "@/components/mdx-editor";
import { headingsPlugin } from "@mdxeditor/editor";

<MdxField
  source="body"
  plugins={[
    ...defaultFieldPlugins,
    headingsPlugin({ allowedHeadingLevels: [2, 3] }),
  ]}
/>;
```
