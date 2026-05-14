---
title: "InPlaceEditor"
---

Renders a value and turns into an editable input on click. Saves the change via `dataProvider.update()`.

## Usage

`<InPlaceEditor>` is useful for quick edits on a detail page without leaving the view. Wrap it around a record context (for instance, inside a `<Show>` or `<Edit>` view, or any subtree where `useRecordContext()` returns a record).

```tsx
import { InPlaceEditor } from "@/components/admin";

const PostTitleEditor = () => <InPlaceEditor source="title" />;
```

By default, `<InPlaceEditor>`:

- shows a `<TextField source={source} />` in reading mode,
- shows a `<TextInput source={source} />` in editing mode,
- submits the change on Enter,
- cancels on Escape, or on blur (when `cancelOnBlur` is `true`, the default).

`<InPlaceEditor>` wraps the editor in its own `<Form>`, so it cannot be used inside another `<Form>`.

## State machine

The editor uses a small state machine to track its state:

- `reading`: shows the read display (`children`). Clicking it enters `editing`.
- `editing`: shows the editor. Submitting enters `saving`. Cancelling returns to `reading`.
- `saving`: calls `useUpdate()`. On success returns to `reading`. On error returns to `editing`.

## Props

| Prop              | Required | Type                                          | Default         | Description                                                                  |
| ----------------- | -------- | --------------------------------------------- | --------------- | ---------------------------------------------------------------------------- |
| `cancelOnBlur`    | Optional | `boolean`                                     | `true`          | Cancel editing on blur instead of submitting                                 |
| `children`        | Optional | `ReactNode`                                   | `<TextField>`   | Reading-mode display                                                         |
| `className`       | Optional | `string`                                      | -               | Wrapper CSS classes                                                          |
| `editor`          | Optional | `ReactNode`                                   | `<TextInput>`   | Editing-mode input                                                           |
| `mutationMode`    | Optional | `'optimistic' \| 'pessimistic' \| 'undoable'` | `'pessimistic'` | Save strategy                                                                |
| `mutationOptions` | Optional | `UseUpdateOptions`                            | `{}`            | Options forwarded to `useUpdate()`                                           |
| `notifyOnSuccess` | Optional | `boolean`                                     | `false`         | Show a notification after a successful save                                  |
| `resource`        | Optional | `string`                                      | from context    | Resource to update                                                           |
| `showButtons`     | Optional | `boolean`                                     | `false`         | Show explicit save / cancel icon buttons next to the editor                  |
| `source`          | Optional | `string`                                      | -               | Field to read and update. Required unless `children` and `editor` are passed |

At least one of `source`, `children`, or `editor` is required.

## `source`

The name of the field to read (in reading mode) and update (after saving).

```tsx
<InPlaceEditor source="title" />
```

## `editor`

Custom editor element used in editing mode. Useful to swap in a `<NumberInput>`, `<SelectInput>`, or a multiline `<TextInput>`.

```tsx
<InPlaceEditor
  source="description"
  editor={
    <TextInput
      source="description"
      multiline
      rows={3}
      label={false}
      helperText={false}
      autoFocus
    />
  }
/>
```

## `children`

Custom read display.

```tsx
<InPlaceEditor source="title">
  <TextField source="title" className="text-lg font-semibold" />
</InPlaceEditor>
```

## `showButtons`

Render explicit save (`Check`) and cancel (`X`) icon buttons next to the editor. When `false` (the default), the form submits implicitly on Enter (or, if `cancelOnBlur` is `false`, on blur).

```tsx
<InPlaceEditor source="title" showButtons cancelOnBlur={false} />
```

## `mutationMode`

Same as the `<Edit>` view:

- `'pessimistic'` (default) — wait for the server response before exiting editing mode.
- `'optimistic'` — update the UI immediately and roll back on error.
- `'undoable'` — show an undoable notification (requires `notifyOnSuccess={true}`).

```tsx
<InPlaceEditor source="title" mutationMode="optimistic" />
```
