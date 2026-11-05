# Chelone P0–P1: Scaffold + Type Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Chelone monorepo and ship `@chelone/core`'s type foundation — a Zod-backed resource registry that infers record types end-to-end (`dataProvider.getList('posts')` → `Post[]`), with a loose fallback when no schema is given.

**Architecture:** A pnpm + turbo monorepo. `@chelone/core` is vanilla TypeScript (no React — enforced by a Biome import-boundary rule). P1 adds types only (no runtime data logic — that's P2): the base record, `defineResources()`, the `RecordOf<>` inference type, and the generically-typed `DataProvider` contract. Type behavior is verified with runnable `vitest --typecheck` / `expectTypeOf` tests.

**Tech Stack:** pnpm, Turborepo, Biome, TypeScript, Vitest (typecheck mode), Zod.

## Global Constraints

- **Repo path:** `chelone` — CONFIRMED. Already `git init`'d with MIT `LICENSE` (© 2026 Rin), a standard Node `.gitignore`, and `.gitattributes`. **Preserve all three** — do NOT re-init or overwrite them.
- **Package manager:** `pnpm` (workspaces). Node ≥ 20.
- **Boundary rule (non-negotiable):** `@chelone/core` MUST NOT import `react`, `react-dom`, `react-hook-form`, or `react-router`. Enforced by Biome `noRestrictedImports` in CI.
- **Versions:** `typescript ^5.5`, `zod ^3.24`, `vitest ^3`, `turbo ^2`, `@biomejs/biome ^2`. (Zod stays on 3.24 for ecosystem/drizzle-zod compat; migration to v4 is a later, separate decision.)
- **Packages are source-only for now** (`main`/`types` → `src/index.ts`); no `dist` emit until a later packaging phase.
- **Base record name:** `ResourceRecord` (Chelone's replacement for ra-core's `RaRecord`). Loose fallback: `LooseRecord` (uses `unknown` index, never `any`).
- **Naming:** npm scope `@chelone/*`; commit style = Conventional Commits.

---

## File Structure

```
chelone
├── package.json                      root: workspaces + scripts
├── pnpm-workspace.yaml
├── turbo.json                        build/test/typecheck pipeline
├── tsconfig.base.json                shared compiler options
├── biome.jsonc                       lint/format + the core boundary rule
├── .gitignore
├── README.md
└── packages/
    ├── core/                         @chelone/core (vanilla TS)
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── vitest.config.ts
    │   └── src/
    │       ├── index.ts              barrel
    │       ├── index.test-d.ts
    │       ├── resource/
    │       │   ├── identifier.ts     Identifier
    │       │   ├── record.ts         ResourceRecord, LooseRecord
    │       │   ├── record.test-d.ts
    │       │   ├── registry.ts       defineResources, ResourceConfig/Map, RecordOf
    │       │   └── registry.test-d.ts
    │       └── data/
    │           ├── types.ts          DataProvider + params/results
    │           └── types.test-d.ts
    └── react/                        @chelone/react (skeleton only in P0)
        ├── package.json
        ├── tsconfig.json
        └── src/index.ts
```

---

## Task 1: Monorepo scaffold + tooling + empty packages

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `.gitignore`, `README.md`
- Create: `packages/core/package.json`, `packages/core/tsconfig.json`, `packages/core/vitest.config.ts`, `packages/core/src/index.ts`
- Create: `packages/react/package.json`, `packages/react/tsconfig.json`, `packages/react/src/index.ts`

**Interfaces:**
- Produces: a working monorepo where `pnpm install`, `pnpm test`, `pnpm typecheck`, `pnpm lint` all run green on empty packages. `@chelone/core` (source barrel `packages/core/src/index.ts`) and `@chelone/react` (depends on `@chelone/core` via `workspace:*`).

- [ ] **Step 1: Create the package directory tree**

The repo already exists (git-init'd, with MIT `LICENSE`, standard Node `.gitignore`, `.gitattributes` — preserve all three; do NOT run `git init` or delete anything).

Run:
```bash
mkdir -p chelone/packages/core/src/resource \
         chelone/packages/core/src/data \
         chelone/packages/react/src
cd chelone && echo "dirs ok"
```
Expected: `dirs ok`

- [ ] **Step 2: Write root config files**

`package.json`:
```json
{
  "name": "chelone",
  "private": true,
  "packageManager": "pnpm@10.14.0",
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck",
    "lint": "biome check ."
  },
  "devDependencies": {
    "@biomejs/biome": "^2.0.0",
    "turbo": "^2.0.0",
    "typescript": "^5.5.0"
  }
}
```

`pnpm-workspace.yaml`:
```yaml
packages:
  - packages/*
  - apps/*
```

`turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "test": { "dependsOn": ["^build"] },
    "typecheck": { "dependsOn": ["^build"] }
  }
}
```

`tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "declaration": true,
    "skipLibCheck": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noUncheckedIndexedAccess": true
  }
}
```

**`.gitignore`** — already present (standard Node) and already ignores `node_modules`, `dist`, `*.tsbuildinfo`, `.env`. Only `.turbo` is missing. **Append it, do NOT overwrite:**
```bash
printf '\n# Turborepo\n.turbo\n' >> chelone/.gitignore
```

`README.md`:
```markdown
# Chelone

A framework-agnostic, type-safe, headless admin engine.

- `@chelone/core` — vanilla-TS core (no React).
- `@chelone/react` — React adapter.

See the charter for the full design.
```

- [ ] **Step 3: Write `@chelone/core` package files**

`packages/core/package.json`:
```json
{
  "name": "@chelone/core",
  "version": "0.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "scripts": {
    "test": "vitest run --typecheck",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": { "zod": "^3.24.0" },
  "devDependencies": { "vitest": "^3.0.0" }
}
```

`packages/core/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "rootDir": "src", "types": [] },
  "include": ["src"]
}
```

`packages/core/vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    passWithNoTests: true,
    typecheck: { enabled: true, tsconfig: "./tsconfig.json" },
  },
});
```

`packages/core/src/index.ts`:
```ts
export {};
```

- [ ] **Step 4: Write `@chelone/react` skeleton**

`packages/react/package.json`:
```json
{
  "name": "@chelone/react",
  "version": "0.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "scripts": { "typecheck": "tsc --noEmit" },
  "dependencies": { "@chelone/core": "workspace:*" },
  "peerDependencies": { "react": "^18 || ^19" },
  "devDependencies": { "@types/react": "^19", "react": "^19" }
}
```

`packages/react/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "rootDir": "src", "jsx": "react-jsx" },
  "include": ["src"]
}
```

`packages/react/src/index.ts`:
```ts
export {};
```

- [ ] **Step 5: Install and verify the toolchain runs green**

Run:
```bash
cd chelone && pnpm install && pnpm typecheck && pnpm test
```
Expected: install succeeds; `turbo run typecheck` passes (empty packages, no errors); `turbo run test` passes (Vitest reports "no test files found" per package, exit 0). If `pnpm test` fails because Vitest treats "no tests" as an error, add `passWithNoTests: true` to `packages/core/vitest.config.ts` `test` block and re-run.

- [ ] **Step 6: Commit**

```bash
cd chelone
git add -A
git commit -m "chore: scaffold chelone monorepo (pnpm+turbo+biome, core+react packages)"
```

---

## Task 2: Core↔adapter boundary lint rule

**Files:**
- Create: `biome.jsonc`

**Interfaces:**
- Produces: a CI-enforceable rule that fails `biome check` if `packages/core/**` imports `react`/`react-dom`/`react-hook-form`/`react-router`.

- [ ] **Step 1: Add a deliberately-violating import to core (the "failing test")**

Append to `packages/core/src/index.ts`:
```ts
// TEMP: boundary-rule probe — must be flagged by biome, removed in step 4
import { useState } from "react";
void useState;
```

- [ ] **Step 2: Write `biome.jsonc` with the boundary rule**

`biome.jsonc`:
```jsonc
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "vcs": { "enabled": true, "clientKind": "git", "useIgnoreFile": true },
  "files": { "includes": ["**/*.ts", "**/*.tsx", "**/*.json", "**/*.jsonc"] },
  "formatter": { "enabled": true, "indentStyle": "space" },
  "linter": { "enabled": true, "rules": { "recommended": true } },
  "overrides": [
    {
      "includes": ["packages/core/**"],
      "linter": {
        "rules": {
          "style": {
            "noRestrictedImports": {
              "level": "error",
              "options": {
                "paths": {
                  "react": "@chelone/core is vanilla TS — no React. Put React code in @chelone/react.",
                  "react-dom": "@chelone/core must not import react-dom.",
                  "react-hook-form": "@chelone/core uses @tanstack/form-core, not react-hook-form.",
                  "react-router": "@chelone/core must not own a router; use the RouterProvider interface."
                }
              }
            }
          }
        }
      }
    }
  ]
}
```

- [ ] **Step 3: Run lint and verify it FAILS on the probe**

Run:
```bash
cd chelone && pnpm lint
```
Expected: FAIL — `noRestrictedImports` error on `packages/core/src/index.ts` for `react`, showing the custom message.

> If Biome reports `noRestrictedImports` as an unknown rule, it has moved groups in your Biome version — check `biome check` output / Biome docs and move the rule under the correct group (`nursery` vs `style`). Then re-run.

- [ ] **Step 4: Remove the probe (make it pass)**

Restore `packages/core/src/index.ts` to:
```ts
export {};
```

- [ ] **Step 5: Run lint and verify it PASSES**

Run:
```bash
cd chelone && pnpm lint
```
Expected: PASS — no errors.

- [ ] **Step 6: Commit**

```bash
cd chelone
git add -A
git commit -m "chore: enforce no-React import boundary in @chelone/core via Biome"
```

---

## Task 3: `Identifier`, `ResourceRecord`, `LooseRecord`

**Files:**
- Create: `packages/core/src/resource/identifier.ts`
- Create: `packages/core/src/resource/record.ts`
- Test: `packages/core/src/resource/record.test-d.ts`

**Interfaces:**
- Produces:
  - `type Identifier = string | number`
  - `interface ResourceRecord<TId extends Identifier = Identifier> { id: TId }`
  - `type LooseRecord = ResourceRecord & { [key: string]: unknown }`

- [ ] **Step 1: Write the failing type test**

`packages/core/src/resource/record.test-d.ts`:
```ts
import { expectTypeOf, it } from "vitest";
import type { LooseRecord, ResourceRecord } from "./record";

it("ResourceRecord requires an id of Identifier type", () => {
  expectTypeOf<ResourceRecord>().toMatchTypeOf<{ id: string | number }>();
  expectTypeOf<ResourceRecord<string>["id"]>().toEqualTypeOf<string>();
});

it("LooseRecord exposes unknown (never any) for extra fields", () => {
  expectTypeOf<LooseRecord["id"]>().toEqualTypeOf<string | number>();
  expectTypeOf<LooseRecord["anythingElse"]>().toEqualTypeOf<unknown>();
});
```

- [ ] **Step 2: Run and verify it fails**

Run:
```bash
cd chelone && pnpm --filter @chelone/core test
```
Expected: FAIL — cannot find module `./record` (types not defined yet).

- [ ] **Step 3: Implement the types**

`packages/core/src/resource/identifier.ts`:
```ts
export type Identifier = string | number;
```

`packages/core/src/resource/record.ts`:
```ts
import type { Identifier } from "./identifier";

/** Base shape every record satisfies: an object with an `id`. Strict — no `any` index. */
export interface ResourceRecord<TId extends Identifier = Identifier> {
  id: TId;
}

/** Fallback record type when a resource has no registered schema. Extra fields are `unknown`, never `any`. */
export type LooseRecord = ResourceRecord & { [key: string]: unknown };
```

- [ ] **Step 4: Run and verify it passes**

Run:
```bash
cd chelone && pnpm --filter @chelone/core test
```
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
cd chelone
git add -A
git commit -m "feat(core): add Identifier, ResourceRecord, LooseRecord base types"
```

---

## Task 4: `defineResources` + `RecordOf` inference

**Files:**
- Create: `packages/core/src/resource/registry.ts`
- Test: `packages/core/src/resource/registry.test-d.ts`

**Interfaces:**
- Consumes: `LooseRecord` from `./record`.
- Produces:
  - `interface ResourceConfig<TSchema extends z.ZodTypeAny = z.ZodTypeAny> { schema?: TSchema }`
  - `type ResourceMap = { [name: string]: ResourceConfig }`
  - `function defineResources<const T extends ResourceMap>(resources: T): T`
  - `type RecordOf<TResources extends ResourceMap, TName extends keyof TResources>` — `z.infer<schema>` if the resource has a schema, else `LooseRecord`.

- [ ] **Step 1: Write the failing type test**

`packages/core/src/resource/registry.test-d.ts`:
```ts
import { describe, expectTypeOf, it } from "vitest";
import { z } from "zod";
import type { LooseRecord } from "./record";
import { defineResources, type RecordOf } from "./registry";

const postSchema = z.object({ id: z.number(), title: z.string() });
type Post = z.infer<typeof postSchema>;

const resources = defineResources({
  posts: { schema: postSchema },
  comments: {}, // no schema → loose fallback
});
type R = typeof resources;

describe("RecordOf", () => {
  it("infers the record type from a resource's schema", () => {
    expectTypeOf<RecordOf<R, "posts">>().toEqualTypeOf<Post>();
  });

  it("falls back to LooseRecord when a resource has no schema", () => {
    expectTypeOf<RecordOf<R, "comments">>().toEqualTypeOf<LooseRecord>();
  });

  it("defineResources preserves literal keys", () => {
    expectTypeOf<keyof R>().toEqualTypeOf<"posts" | "comments">();
  });
});
```

- [ ] **Step 2: Run and verify it fails**

Run:
```bash
cd chelone && pnpm --filter @chelone/core test
```
Expected: FAIL — cannot find module `./registry`.

- [ ] **Step 3: Implement the registry + inference**

`packages/core/src/resource/registry.ts`:
```ts
import type { z } from "zod";
import type { LooseRecord } from "./record";

/** Per-resource configuration. In P1 this is just an optional Zod schema. */
export interface ResourceConfig<TSchema extends z.ZodTypeAny = z.ZodTypeAny> {
  schema?: TSchema;
}

/** A map of resource-name → config. The registry's shape. */
export type ResourceMap = { [name: string]: ResourceConfig };

/**
 * Identity helper that pins literal resource names + schema types via `const`.
 * `defineResources({ posts: { schema: postSchema } })` keeps `"posts"` literal
 * and `typeof postSchema` exact, enabling end-to-end inference.
 */
export function defineResources<const T extends ResourceMap>(resources: T): T {
  return resources;
}

/**
 * The record type for a given resource name in a registry:
 * `z.infer<schema>` when a schema is present, else `LooseRecord`.
 */
export type RecordOf<
  TResources extends ResourceMap,
  TName extends keyof TResources,
> = TResources[TName] extends { schema: infer S }
  ? S extends z.ZodTypeAny
    ? z.infer<S>
    : LooseRecord
  : LooseRecord;
```

- [ ] **Step 4: Run and verify it passes**

Run:
```bash
cd chelone && pnpm --filter @chelone/core test
```
Expected: PASS (3 new tests + prior tests).

- [ ] **Step 5: Commit**

```bash
cd chelone
git add -A
git commit -m "feat(core): add defineResources + RecordOf schema inference with loose fallback"
```

---

## Task 5: Generically-typed `DataProvider` contract

**Files:**
- Create: `packages/core/src/data/types.ts`
- Test: `packages/core/src/data/types.test-d.ts`

**Interfaces:**
- Consumes: `Identifier` from `../resource/identifier`; `ResourceRecord`, `LooseRecord` from `../resource/record`; `RecordOf`, `ResourceMap` from `../resource/registry`.
- Produces: `DataProvider<TResources>` with `getList/getOne/create/update/delete`, each returning `RecordOf<TResources, TName>`-typed results; plus the param/result interfaces.

- [ ] **Step 1: Write the failing type test**

`packages/core/src/data/types.test-d.ts`:
```ts
import { describe, expectTypeOf, it } from "vitest";
import { z } from "zod";
import { defineResources } from "../resource/registry";
import type { DataProvider } from "./types";

const postSchema = z.object({ id: z.number(), title: z.string() });
type Post = z.infer<typeof postSchema>;

const resources = defineResources({
  posts: { schema: postSchema },
  comments: {},
});

describe("DataProvider inference", () => {
  const dp = {} as DataProvider<typeof resources>;

  it("getList returns the resource's record type", async () => {
    const result = await dp.getList("posts", {});
    expectTypeOf(result.data).toEqualTypeOf<Post[]>();
  });

  it("getOne returns a single typed record", async () => {
    const result = await dp.getOne("posts", { id: 1 });
    expectTypeOf(result.data).toEqualTypeOf<Post>();
  });

  it("a schema-less resource yields LooseRecord fields as unknown", async () => {
    const result = await dp.getOne("comments", { id: 1 });
    expectTypeOf(result.data.id).toEqualTypeOf<string | number>();
    expectTypeOf(result.data.body).toEqualTypeOf<unknown>();
  });

  it("rejects unknown resource names", () => {
    // @ts-expect-error "widgets" is not in the registry
    void dp.getOne("widgets", { id: 1 });
  });
});
```

- [ ] **Step 2: Run and verify it fails**

Run:
```bash
cd chelone && pnpm --filter @chelone/core test
```
Expected: FAIL — cannot find module `./types`.

- [ ] **Step 3: Implement the DataProvider types**

`packages/core/src/data/types.ts`:
```ts
import type { Identifier } from "../resource/identifier";
import type { LooseRecord, ResourceRecord } from "../resource/record";
import type { RecordOf, ResourceMap } from "../resource/registry";

export interface PaginationPayload {
  page: number;
  perPage: number;
}
export interface SortPayload {
  field: string;
  order: "ASC" | "DESC";
}
export type FilterPayload = { [key: string]: unknown };

export interface GetListParams {
  pagination?: PaginationPayload;
  sort?: SortPayload;
  filter?: FilterPayload;
  meta?: unknown;
}
export interface GetListResult<TRecord extends ResourceRecord = LooseRecord> {
  data: TRecord[];
  total?: number;
}

export interface GetOneParams<TId extends Identifier = Identifier> {
  id: TId;
  meta?: unknown;
}
export interface GetOneResult<TRecord extends ResourceRecord = LooseRecord> {
  data: TRecord;
}

export interface CreateParams<TRecord extends ResourceRecord = LooseRecord> {
  data: Partial<TRecord>;
  meta?: unknown;
}
export interface CreateResult<TRecord extends ResourceRecord = LooseRecord> {
  data: TRecord;
}

export interface UpdateParams<TRecord extends ResourceRecord = LooseRecord> {
  id: Identifier;
  data: Partial<TRecord>;
  previousData?: TRecord;
  meta?: unknown;
}
export interface UpdateResult<TRecord extends ResourceRecord = LooseRecord> {
  data: TRecord;
}

export interface DeleteParams<TRecord extends ResourceRecord = LooseRecord> {
  id: Identifier;
  previousData?: TRecord;
  meta?: unknown;
}
export interface DeleteResult<TRecord extends ResourceRecord = LooseRecord> {
  data: TRecord;
}

/**
 * The data contract: 5 promise-returning CRUD verbs (P1 subset).
 * Parameterized by a registry so `resource` names are checked and record
 * types flow to results via `RecordOf`.
 */
export interface DataProvider<TResources extends ResourceMap = ResourceMap> {
  getList<TName extends keyof TResources & string>(
    resource: TName,
    params: GetListParams,
  ): Promise<GetListResult<RecordOf<TResources, TName>>>;

  getOne<TName extends keyof TResources & string>(
    resource: TName,
    params: GetOneParams,
  ): Promise<GetOneResult<RecordOf<TResources, TName>>>;

  create<TName extends keyof TResources & string>(
    resource: TName,
    params: CreateParams<RecordOf<TResources, TName>>,
  ): Promise<CreateResult<RecordOf<TResources, TName>>>;

  update<TName extends keyof TResources & string>(
    resource: TName,
    params: UpdateParams<RecordOf<TResources, TName>>,
  ): Promise<UpdateResult<RecordOf<TResources, TName>>>;

  delete<TName extends keyof TResources & string>(
    resource: TName,
    params: DeleteParams<RecordOf<TResources, TName>>,
  ): Promise<DeleteResult<RecordOf<TResources, TName>>>;
}
```

- [ ] **Step 4: Run and verify it passes**

Run:
```bash
cd chelone && pnpm --filter @chelone/core test
```
Expected: PASS (4 new tests + prior).

- [ ] **Step 5: Commit**

```bash
cd chelone
git add -A
git commit -m "feat(core): add generically-typed DataProvider contract (registry-inferred)"
```

---

## Task 6: Public barrel exports + smoke test

**Files:**
- Modify: `packages/core/src/index.ts`
- Test: `packages/core/src/index.test-d.ts`

**Interfaces:**
- Consumes: everything from `resource/*` and `data/types`.
- Produces: the public surface of `@chelone/core` — `defineResources` (value) and all types re-exported from the package root.

- [ ] **Step 1: Write the failing test**

`packages/core/src/index.test-d.ts`:
```ts
import { expectTypeOf, it } from "vitest";
import { z } from "zod";
import { defineResources, type DataProvider, type RecordOf } from "./index";

it("re-exports defineResources and inference types from the root", () => {
  const resources = defineResources({
    posts: { schema: z.object({ id: z.number(), title: z.string() }) },
  });
  expectTypeOf<RecordOf<typeof resources, "posts">>().toEqualTypeOf<{
    id: number;
    title: string;
  }>();
  expectTypeOf<DataProvider<typeof resources>>().not.toBeNever();
});
```

- [ ] **Step 2: Run and verify it fails**

Run:
```bash
cd chelone && pnpm --filter @chelone/core test
```
Expected: FAIL — `defineResources`/`DataProvider`/`RecordOf` not exported from `./index`.

- [ ] **Step 3: Write the barrel**

`packages/core/src/index.ts`:
```ts
export type { Identifier } from "./resource/identifier";
export type { LooseRecord, ResourceRecord } from "./resource/record";
export { defineResources } from "./resource/registry";
export type { RecordOf, ResourceConfig, ResourceMap } from "./resource/registry";
export type {
  CreateParams,
  CreateResult,
  DataProvider,
  DeleteParams,
  DeleteResult,
  FilterPayload,
  GetListParams,
  GetListResult,
  GetOneParams,
  GetOneResult,
  PaginationPayload,
  SortPayload,
  UpdateParams,
  UpdateResult,
} from "./data/types";
```

- [ ] **Step 4: Run tests, typecheck, and lint (full green gate)**

Run:
```bash
cd chelone && pnpm test && pnpm typecheck && pnpm lint
```
Expected: all PASS. (Confirms the barrel, the boundary rule, and every type test are green together.)

- [ ] **Step 5: Commit**

```bash
cd chelone
git add -A
git commit -m "feat(core): expose public barrel (defineResources + registry/data types)"
```

---

## Self-Review

**Spec coverage (charter §5.3 + §7 P0/P1):**
- P0 scaffold (monorepo, pnpm+turbo+biome, empty core+react) → Tasks 1–2. ✅
- P0 boundary lint rule → Task 2. ✅
- P1 strict base record (`RaRecord`→`ResourceRecord`), `Identifier` → Task 3. ✅
- P1 Zod resource registry + resource→type inference → Task 4. ✅
- P1 `DataProvider` types wired to inference → Task 5. ✅
- Public surface → Task 6. ✅
- *Deferred (correctly, per phasing):* runtime data hooks on query-core (P2), store/i18n/auth (P3) — no tasks here, as intended.

**Placeholder scan:** No TBD/TODO/"handle errors"/vague steps; every code step shows complete code. ✅

**Type consistency:** `ResourceRecord`/`LooseRecord`/`Identifier` (Task 3) → consumed as-named in `registry.ts` (Task 4) and `data/types.ts` (Task 5); `defineResources`/`RecordOf`/`ResourceMap`/`ResourceConfig` (Task 4) → consumed in Task 5 and re-exported in Task 6 under identical names. ✅

**Known tooling risks (with in-plan mitigations):** Biome `noRestrictedImports` group path (Task 2 Step 3 note); Vitest "no tests" exit code (Task 1 Step 5 note). Both have verify-and-fix steps.
