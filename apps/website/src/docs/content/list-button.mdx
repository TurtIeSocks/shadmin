---
title: "ListButton"
---

Link button that opens the list view of the current resource.

## Usage

Commonly used to navigate back to the list from an `<Edit>` or `<Show>` view:

```tsx {4}
import { Edit, ListButton } from "@/components/admin";

const PostEdit = () => <Edit actions={<ListButton />}>...</Edit>;
```

Reads the resource from `ResourceContext` by default. If the current user does not have list access (per `authProvider.canAccess`), the button renders nothing.

## Props

| Prop          | Required | Type        | Default          | Description                          |
| ------------- | -------- | ----------- | ---------------- | ------------------------------------ |
| `className`   | Optional | `string`    | -                | Additional classes                   |
| `icon`        | Optional | `ReactNode` | List icon        | Custom icon element                  |
| `label`       | Optional | `string`    | `ra.action.list` | i18n key / label                     |
| `resource`    | Optional | `string`    | From context     | Resource name                        |
| `scrollToTop` | Optional | `boolean`   | `true`           | Whether the list page scrolls to top |

## `icon`

Replaces the default `<List />` shown alongside the label. Pass any React node — typically another lucide-react icon.

```tsx
import { LayoutList } from "lucide-react";

<ListButton icon={<LayoutList />} />;
```

## `label`

By default, the label is the translation of the `ra.action.list` key, which reads "List".

You can customize the label for a specific resource by adding a `resources.{resource}.action.list` key to your translation messages. It receives `%{name}` (plural resource name):

```js
const messages = {
  resources: {
    posts: {
      action: {
        list: "Back to %{name}",
      },
    },
  },
};
```

You can also pass a custom string or translation key directly via the `label` prop:

```tsx
<ListButton label="All Posts" />
<ListButton label="resources.posts.action.list" />
```

## `ref`

Forwards a ref to the underlying `<Button>` element.

```tsx
import { useRef } from "react";

const ref = useRef<HTMLAnchorElement>(null);
<ListButton ref={ref} />;
```

## `scrollToTop`

When `true` (the default), the list page scrolls to the top after navigation. Set to `false` to preserve the current scroll position.

```tsx
<ListButton scrollToTop={false} />
```
