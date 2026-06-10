---
title: "JobMonitor"
---

Background job queue dashboard. Polls a `jobs` resource (or whichever you
pass), groups rows by `status`, and exposes retry / cancel actions per row.

## Usage

```tsx
import { JobMonitor } from '@/components/admin';

<JobMonitor resource="jobs" pollInterval={5000} />
<JobMonitor
  resource="jobs"
  pollInterval={2000}
  tabs={["failed", "running", "queued"]}
/>
```

## Job record shape

```ts
interface JobRecord {
  id: string | number;
  type?: string;
  status: "queued" | "running" | "failed" | "done" | "cancelled";
  payload?: unknown;
  attempts?: number;
  lastError?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
```

## Props

| Prop             | Required | Type          | Default                                | Description                             |
| ---------------- | -------- | ------------- | -------------------------------------- | --------------------------------------- |
| `resource`       | Optional | `string`      | Context                                | Override resource                       |
| `pollInterval`   | Optional | `number`      | `5000`                                 | Polling interval in ms (`0` = disabled) |
| `tabs`           | Optional | `JobStatus[]` | `["running","queued","failed","done"]` | Tab order                               |
| `statusSource`   | Optional | `string`      | `"status"`                             | Record field name                       |
| `typeSource`     | Optional | `string`      | `"type"`                               | Record field name                       |
| `payloadSource`  | Optional | `string`      | `"payload"`                            | Record field name                       |
| `errorSource`    | Optional | `string`      | `"lastError"`                          | Record field name                       |
| `attemptsSource` | Optional | `string`      | `"attempts"`                           | Record field name                       |
| `actions`        | Optional | `boolean`     | `true`                                 | Show retry/cancel buttons               |

## Actions

- **Retry** — visible on `failed` rows. Sets `status: 'queued'` and increments `attempts`.
- **Cancel** — visible on `running` and `queued` rows. Sets `status: 'cancelled'`.

## Polling

Wraps `useGetList` with TanStack Query's `refetchInterval`. Set
`pollInterval={0}` to disable. Recommended values: `2000`–`10000` ms.

## Limitations (v1)

- No log-tail (would require a separate streaming endpoint).
- No payload editing — payload is read-only.
- No bulk-retry / bulk-cancel across many rows.
- Cache hit/miss tracking deferred to `<DataProviderDevtools>`.
