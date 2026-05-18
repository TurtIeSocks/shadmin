---
title: "CloneButton"
---

Link button that opens the create form pre-filled with the current record's data.

## Usage

Use it inside a `RecordContext`, for example in the actions of a `<Show>` view, or in the rows of a `<DataTable>`.

```tsx {4}
import { CloneButton, Show } from "@/components/admin";

const PostShow = () => <Show actions={<CloneButton />}>...</Show>;
```

On click, the button navigates to the `create` route of the current resource (e.g., `/posts/create`) and passes the record's data (without `id`) as a search param so the form can be pre-filled.

## Props

| Prop          | Required | Type        | Default           | Description                             |
| ------------- | -------- | ----------- | ----------------- | --------------------------------------- |
| `className`   | Optional | `string`    | -                 | Additional classes                      |
| `icon`        | Optional | `ReactNode` | Copy icon         | Custom icon element                     |
| `label`       | Optional | `string`    | `ra.action.clone` | i18n key / label                        |
| `record`      | Optional | `RaRecord`  | From context      | Record used to pre-fill the create form |
| `resource`    | Optional | `string`    | From context      | Resource name                           |
| `scrollToTop` | Optional | `boolean`   | `true`            | Whether the create page scrolls to top  |

## `icon`

Replaces the default `<Copy />` shown alongside the label. Pass any React node — typically another lucide-react icon.

```tsx
import { CopyPlus } from "lucide-react";

<CloneButton icon={<CopyPlus />} />
```

## `label`

By default, the label is the translation of the `ra.action.clone` key, which reads "Clone".

You can customize the label for a specific resource by adding a `resources.{resource}.action.clone` key to your translation messages. It receives `%{name}` (singular resource name):

```js
const messages = {
  resources: {
    posts: {
      action: {
        clone: "Duplicate %{name}",
      },
    },
  },
};
```

You can also pass a custom string or translation key directly via the `label` prop:

```tsx
<CloneButton label="Duplicate" />
<CloneButton label="resources.posts.action.clone" />
```
