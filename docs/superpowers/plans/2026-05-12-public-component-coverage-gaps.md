# Public Component Coverage Gaps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every public admin component a measurable coverage path: story, co-located browser spec, docs page, and demo gallery example.

**Architecture:** A reusable audit script defines the public component inventory from `src/components/admin/index.ts`, filters out private/provider implementation pieces, and reports missing artifacts. Coverage is added in waves by component family, with story-driven tests matching the existing suite.

**Tech Stack:** React 19, TypeScript, ra-core, shadcn/ui, Storybook 10, Vitest browser + Playwright, Astro docs.

---

## Progress

- [x] Create this implementation plan.
- [x] Add `scripts/audit-component-coverage.mjs`.
- [x] Add demo component gallery resource.
- [x] Wave 1: high-risk inputs and fields.
- [x] Wave 2: list, data, and reference components.
- [x] Wave 3: buttons, actions, filters, and layouts.
- [x] Wave 4: auth, notification, theme, inspector, and miscellaneous public components.
- [x] Run full verification: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm doc:build`, `pnpm build-storybook`, `pnpm demo:build`.

## Coverage Contract

The audit target is public admin-facing components exported from `src/components/admin/index.ts`.

Excluded from one-component-one-artifact coverage:

- Pure themes and context hooks.
- Provider/root implementation internals.
- Low-level tab/content implementation pieces covered through their parent components.
- Private helper components that are not meant to be discovered directly by users.

Before: a component like `TextField` could have docs but no story or spec, so regressions were easy to miss outside a full demo path.

After: `TextField` has a focused story, a spec that renders that story, docs showing empty and populated record behavior, and a component gallery example.

## Task 1: Audit Infrastructure

- [x] Create `scripts/audit-component-coverage.mjs`.
- [x] Report story/spec/docs/demo-gallery status for each public target.
- [x] Support `--json` for machine-readable output.
- [x] Support `--fail-on-missing` for CI-ready enforcement once all waves are complete.

## Task 2: Demo Gallery

- [x] Create `src/demo/component-gallery/ComponentGallery.tsx`.
- [x] Create `src/demo/component-gallery/index.tsx`.
- [x] Register the gallery as a `Resource` in `src/demo/App.tsx`.
- [x] Add i18n labels under `resources.component_gallery`.

## Task 3: Coverage Waves

- [x] Add missing stories before adding specs for components with no story.
- [x] Add co-located specs that import and render story exports.
- [x] Complete docs for public components missing pages.
- [x] Add every covered component to the demo gallery registry.

## Verification

- [x] `node scripts/audit-component-coverage.mjs`
- [x] `pnpm typecheck`
- [x] `pnpm lint`
- [x] `pnpm test`
- [x] `pnpm doc:build`
- [x] `pnpm build-storybook`
- [x] `pnpm demo:build`
