---
title: "SupabaseEditGuesser"
---

Schema-aware drop-in `<Edit>`. Renders inputs based on the Supabase OpenAPI schema, with PostgREST `@ilike` filters wired up for `<AutocompleteInput>` references.

## Usage

```tsx
import { Resource } from "ra-core";
import { SupabaseEditGuesser } from "@/components/supabase";

<Resource name="companies" edit={SupabaseEditGuesser} />
```

## Props

| Prop | Type | Description |
|---|---|---|
| `enableLog` | `boolean` | Default: `process.env.NODE_ENV === "development"` |

All `<Edit>` props are also accepted.
