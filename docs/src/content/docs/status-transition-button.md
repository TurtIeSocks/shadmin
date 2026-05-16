---
title: "StatusTransitionButton"
---

FSM-aware status change button. Reads the record's current status, looks up
allowed transitions in a config, optionally filters via guard predicates, and
fires `useUpdate` on selection.

## Usage

```tsx
import { StatusTransitionButton } from '@/components/admin';

const TRANSITIONS = {
  draft: ["review", "archived"],
  review: ["published", "draft"],
  published: ["archived"],
  archived: [],
};

<StatusTransitionButton source="status" transitions={TRANSITIONS} />
{/* With guards */}
<StatusTransitionButton
  source="status"
  transitions={TRANSITIONS}
  guards={{
    "review->published": (record) => record.requiredFields != null,
  }}
  confirm
/>
```

## Props

| Prop           | Required | Type                                                | Default     | Description |
| -------------- | -------- | --------------------------------------------------- | ----------- | ----------- |
| `transitions`  | Required | `Record<string, readonly string[]>`                 | -           | Allowed transitions per state |
| `source`       | Optional | `string`                                            | `"status"`  | Record field holding the state |
| `guards`       | Optional | `Record<string, (record) => boolean>`               | -           | `${from}->${to}` predicates |
| `resource`     | Optional | `string`                                            | Context     | Override resource |
| `confirm`      | Optional | `boolean`                                           | `false`     | Native confirm before update |
| `onTransition` | Optional | `(from, to, record) => void`                        | -           | Side-effect callback |

## Terminal states

When the current state maps to an empty array, the button is rendered disabled.
