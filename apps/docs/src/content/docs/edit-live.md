---
title: EditLive
---

`<EditLive>` is a drop-in replacement for `<Edit>` that subscribes to realtime events for the current record. When an `updated` or `deleted` event arrives on `resource/<name>/<id>` — or when the transport reconnects — the record is automatically re-fetched.

## Usage

Replace `<Edit>` with `<EditLive>` on any edit page:

```tsx
import { SimpleForm, TextInput } from "@/components/admin";
import { EditLive } from "@/components/realtime";

export const PostEdit = () => (
  <EditLive>
    <SimpleForm>
      <TextInput source="title" />
      <TextInput source="body" multiline />
    </SimpleForm>
  </EditLive>
);
```

## Props

`<EditLive>` accepts every prop that `<Edit>` accepts. See the [`<Edit>` documentation](./edit) for the full prop reference.

| Prop | Required | Type | Default | Description |
|------|----------|------|---------|-------------|
| `children` | Optional* | `ReactNode` | — | The form component |
| `render` | Optional* | `function` | — | Alternate render receiving the edit context |
| `...editProps` | Optional | — | — | All `<Edit>` props are forwarded unchanged |

`*` Provide either `children` or `render`.

## Notes

- Internally renders `<Edit>` plus a hidden `<EditLiveSubscription>` that calls `useSubscribeToRecord` and `useOnReconnect`.
- The subscription targets `resource/<name>/<id>` — the specific record being edited. Events on the broader resource topic are not handled here.
- If the record is deleted while the editor is open, the query is invalidated and the page will show an error or redirect depending on the `redirect` prop.
- Combine with `<LockOnMount>` inside the form to prevent concurrent edits.
