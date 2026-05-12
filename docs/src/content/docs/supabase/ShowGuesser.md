---
title: "SupabaseShowGuesser"
---

Schema-aware drop-in `<Show>`. Renders fields based on the Supabase OpenAPI schema definition for the current resource.

## Usage

```tsx
import { Resource } from "ra-core";
import { SupabaseShowGuesser } from "@/components/supabase";

<Resource name="companies" show={SupabaseShowGuesser} />
```

## Props

| Prop | Type | Description |
|---|---|---|
| `enableLog` | `boolean` | Default: `process.env.NODE_ENV === "development"` |

All `<Show>` props are also accepted.
