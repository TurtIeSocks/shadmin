---
title: "SupabaseListGuesser"
---

Schema-aware drop-in `<List>` that introspects the Supabase OpenAPI schema to detect foreign keys (rendered as `<ReferenceField>`) and timestamps (rendered as `<DateField>`).

## Usage

```tsx
import { Resource } from "ra-core";
import { SupabaseListGuesser } from "@/components/supabase";

<Resource name="companies" list={SupabaseListGuesser} />;
```

In development, the inferred `<List>` source is logged to the browser console so you can copy-paste it into a real `CompanyList.tsx` and customize further. Disable the logging with `enableLog={false}`.

## Props

| Prop        | Type      | Description                                       |
| ----------- | --------- | ------------------------------------------------- |
| `enableLog` | `boolean` | Default: `process.env.NODE_ENV === "development"` |

All `<List>` props are also accepted.
