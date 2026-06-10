---
title: "PresenceBar"
---

`<PresenceBar>` shows a stack of avatars representing other users currently viewing or editing the same record. By default it uses the browser's `BroadcastChannel` API for same-origin cross-tab presence, so it works in dev/demo without backend setup. For production, plug in a WebSocket / Supabase Realtime / SSE transport via the `transport` prop.

## Usage

```tsx
import { Show, ShowActions, PresenceBar } from "@/components/admin";

const ProductShow = () => (
  <Show
    actions={
      <ShowActions>
        <PresenceBar />
      </ShowActions>
    }
  >
    {/* ... */}
  </Show>
);
```

When no `topic` is set, it derives the topic from the resource + record id: `presence/{resource}/{id}`.

## Props

| Prop          | Type                    | Default                     | Description                                        |
| ------------- | ----------------------- | --------------------------- | -------------------------------------------------- |
| `topic`       | `string`                | derived from record context | Pub/sub channel name.                              |
| `currentUser` | `{ id; name; avatar? }` | from `useGetIdentity()`     | Who I am.                                          |
| `maxAvatars`  | `number`                | `5`                         | Cap before showing `+N more`.                      |
| `heartbeatMs` | `number`                | `15000`                     | How often to re-broadcast presence.                |
| `staleMs`     | `number`                | `30000`                     | Drop users without a heartbeat after this many ms. |
| `transport`   | `PresenceTransport`     | BroadcastChannel            | Plug in a custom transport.                        |

## Custom transport

```ts
interface PresenceTransport {
  subscribe: (
    topic: string,
    handler: (state: PresenceState) => void,
  ) => () => void;
  publish: (topic: string, state: PresenceState) => void;
}

interface PresenceState {
  user: { id: string; name: string; avatar?: string };
  timestamp: number;
}
```

Example WebSocket adapter:

```ts
const wsTransport: PresenceTransport = {
  subscribe: (topic, handler) => {
    const ws = new WebSocket(`wss://realtime.example.com/${topic}`);
    ws.addEventListener("message", (ev) => handler(JSON.parse(ev.data)));
    return () => ws.close();
  },
  publish: (topic, state) => {
    /* send to your realtime endpoint */
  },
};
```

## Notes

- BroadcastChannel only works for same-origin tabs in the same browser. Use a network transport for cross-machine presence.
- The component renders nothing when no other users are present, so it's safe to embed unconditionally.
