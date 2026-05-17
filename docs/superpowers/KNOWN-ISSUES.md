# Known Issues

## CsvImport: commit step reports `0 valid · 0 errors · 0 total` on real uploads

**Status:** Open. Reproducible in the `Basic` Storybook story when a user manually uploads a CSV, navigates Upload → Map → Preview → Commit.

**Symptom:** The commit step renders "Import complete · 0 valid · 0 errors · 0 total" instead of the actual row counts, even when the user uploaded valid data.

**Root cause:** `<CsvImportCommitStep>`'s `useEffect` runs once on mount (deps `[]`). Because `<WizardForm>` mounts all 4 steps simultaneously and hides inactive ones via `display:none`, the commit step's effect fires the moment the dialog opens — before the user has uploaded anything. With `parsedRows=[]` at that point, the import logic completes immediately with a zero report and `setDone(true)`. Subsequent navigation to step 4 just shows the already-complete (empty) report.

The seeded test stories (`CommitStep`, `CommitWithErrors`) don't expose the bug because `<SeedParsed>` populates `parsedRows` _before_ the dialog opens, so when the commit step mounts the effect runs with valid data.

**Fix sketch (that should work but resisted multiple attempts in one short session):**

1. Export `useWizard` from `wizard-form.tsx`.
2. In `CsvImportCommitStep`, gate the effect on the step being active AND data being present:
   ```tsx
   const { currentStep, totalSteps } = useWizard();
   const isActive = currentStep === totalSteps - 1;
   useEffect(() => {
     if (!isActive || done || ctx.parsedRows.length === 0) return;
     // ... existing run() logic
   }, [isActive, done, ctx.parsedRows.length]);
   ```
3. Drop the `AutoAdvanceTo` helper from `CommitStep` / `CommitWithErrors` stories.
4. Rewrite the two failing tests to manually click `Next` three times instead of relying on auto-advance.

**Why the fix didn't land in this session:** Three attempts each got partway then either (a) caused an infinite render loop ("Maximum update depth exceeded") in the test environment, or (b) reached the commit step but the in-flight `dp.create` await hung at "Importing 0 of 1" and `setDone(true)` never fired. The latter symptom strongly suggests a cancellation-flag interaction with `[isActive]` deps causing the effect to re-fire mid-import, but I ran out of time/clarity to isolate it cleanly.

**Workaround for users today:**

- Use the `Basic` story for visual demo only; don't rely on the on-mount auto-import behavior in production.
- For production usage, either seed `parsedRows` before the dialog opens or accept the empty-report cosmetic glitch.

**Related files:**

- [src/components/admin/csv-import.tsx:357](src/components/admin/csv-import.tsx#L357) — the `useEffect` with `[]` deps.
- [src/components/admin/wizard-form.tsx:76](src/components/admin/wizard-form.tsx#L76) — `useWizard` is local, needs `export`.
- [src/stories/csv-import.stories.tsx](src/stories/csv-import.stories.tsx) — `AutoAdvanceTo` race-conditions with form validation when tests don't seed data first.

**Future work:** A cleaner refactor would be to move the import trigger from a mount-effect to the wizard's Save submit handler, so the user-initiated Save action is the canonical signal to commit. This removes all timing ambiguity but changes the UX slightly (the commit step would show a "Click Save to import" CTA instead of auto-running).
