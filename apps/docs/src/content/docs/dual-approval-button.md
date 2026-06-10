---
title: "DualApprovalButton"
---

Four-eyes / segregation-of-duties approval button. Each click adds the current
user's id to an approver array on the record; once the count reaches
`required`, the status flips to `approved`. Self-approval is blocked.

## Usage

```tsx
import { DualApprovalButton, Show, RecordField } from "@/components/admin";

const ExpenseShow = () => (
  <Show>
    <RecordField source="title" />
    <DualApprovalButton required={2} />
  </Show>
);
```

## Props

| Prop             | Required | Type     | Default       | Description                                |
| ---------------- | -------- | -------- | ------------- | ------------------------------------------ |
| `required`       | Optional | `number` | `2`           | Approvers needed                           |
| `approverSource` | Optional | `string` | `"approvers"` | Field for the approver id array            |
| `statusSource`   | Optional | `string` | `"status"`    | Field flipped to `"approved"` on threshold |
| `resource`       | Optional | `string` | Context       | Override resource                          |

## Record shape

The record must carry an array field (default name `approvers`) holding the
ids of users who have already approved. When `approvers.length >= required`,
the button renders a "Fully approved" badge instead of the action button.

## Self-approval blocking

`useGetIdentity()` provides the current user's id. If that id is already in
`approvers`, the button is disabled with a "You already approved" tooltip.
