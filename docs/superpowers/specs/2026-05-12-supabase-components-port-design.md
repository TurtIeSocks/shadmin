# Port ra-supabase components to shadcn-admin-kit

**Status**: Draft
**Date**: 2026-05-12
**Author**: Brainstorm session

## Summary

Port the UI layer of [ra-supabase](https://github.com/marmelab/ra-supabase) (currently shipped as `ra-supabase-ui-materialui`) into shadcn-admin-kit as an opt-in set of components under `src/components/supabase/`. Users install Supabase peer dependencies on demand and gain:

- Supabase-flavored authentication UI (login with optional social providers, forgot-password, set-password)
- Schema-aware CRUD guessers that introspect Supabase's auto-generated OpenAPI schema to detect foreign keys and infer `<ReferenceInput>`/`<AutocompleteInput>` automatically
- A one-line `<AdminGuesser instanceUrl={...} apiKey={...} />` umbrella component that wires up data + auth + auth routes + auto-generated resources
- Drop-in English + French translations matching the upstream `ra-supabase-language-*` packages

The headless `ra-supabase-core` package (data provider, auth provider, hooks) stays upstream and is consumed as a **peer dependency**. The port is purely the UI layer.

## Goals

1. Allow a developer with an existing Supabase project to drop `<AdminGuesser instanceUrl={...} apiKey={...} />` into their app and get a working admin without writing data/auth provider code.
2. Provide Supabase-aware auth pages (login, social, forgot-password, set-password) that share the kit's existing split-screen aesthetic.
3. Provide schema-aware guessers that produce better-than-default scaffolding (foreign-key references, autocomplete with PostgREST `@ilike` filters) — strictly superior to the kit's existing generic guessers for Supabase users.
4. Match the upstream `ra-supabase` public API where reasonable so users can port existing projects with minimal churn.
5. Keep the non-Supabase user experience untouched: no new hard dependencies, no bundle bloat, no behavioral changes to existing components beyond a transparent `AuthLayout` refactor.

## Non-goals

- **Porting `ra-supabase-core`**. It is headless and ships independently — users add it as a peer dependency.
- **Porting `ra-supabase`'s `defaultI18nProvider`**. The kit ships its own; we ship a merge helper instead.
- **Porting the ra-supabase demo app**. The kit's existing `src/demo/` continues using fake REST data.
- **Storage / file-upload UI for Supabase Storage**. Roadmap item in ra-supabase, not yet built upstream.
- **Replacing the existing kit `LoginPage`**. It stays in place (with a transparent refactor to consume the shared `AuthLayout`). The Supabase login page is a sibling, not a replacement.

## Architecture

### Dependency model

The Supabase components ship in the registry. Peer dependencies (added to `package.json` `peerDependencies` and listed in the component's docs install instructions):

- `ra-supabase-core` — `supabaseDataProvider`, `supabaseAuthProvider`, `useAPISchema`, `useResetPassword`, `useSetPassword`, `useSupabaseAccessToken`
- `@supabase/supabase-js` — `createClient`, `Provider` type
- `openapi-types` — for `useAPISchema()`'s `OpenAPIV2.Document` return type

Already in `dependencies`: `inflection`, `ra-core`, `lucide-react`, `react-hook-form`, the radix primitives, etc.

### File layout

```
src/components/admin/
  auth-layout.tsx                  # NEW — extracted split-screen chrome
  login-page.tsx                   # REFACTORED to consume AuthLayout

src/components/supabase/
  index.ts                         # public exports
  login-page.tsx
  login-form.tsx
  forgot-password-page.tsx
  forgot-password-form.tsx
  set-password-page.tsx
  set-password-form.tsx
  social-auth-button.tsx
  icons.tsx
  list-guesser.tsx
  show-guesser.tsx
  edit-guesser.tsx
  create-guesser.tsx
  use-crud-guesser.tsx
  inferred-element.ts
  infer-element-from-type.ts
  edit-field-types.tsx
  admin-guesser.tsx
  i18n/
    en.ts
    fr.ts
    index.ts                       # defaultSupabaseI18nProvider helper
  __fixtures__/
    example-schema.json            # OpenAPI fixture for guesser tests

src/stories/supabase/
  login-page.stories.tsx
  forgot-password-page.stories.tsx
  set-password-page.stories.tsx
  social-auth-button.stories.tsx
  list-guesser.stories.tsx
  show-guesser.stories.tsx
  edit-guesser.stories.tsx
  create-guesser.stories.tsx
  admin-guesser.stories.tsx
  _mocks.ts                        # shared ra-supabase-core mocks

docs/src/content/docs/supabase/
  getting-started.md
  admin-guesser.md
  login-page.md
  forgot-password-page.md
  set-password-page.md
  social-auth-button.md
  list-guesser.md
  show-guesser.md
  edit-guesser.md
  create-guesser.md
  i18n.md
```

Co-located tests live next to each component (`*.spec.tsx`) per the kit's convention.

## Component design

### Shared `AuthLayout` (new, in `src/components/admin/`)

Extracted from the existing `LoginPage`'s chrome. Used by both the existing `LoginPage` and the three new Supabase auth pages.

```ts
type AuthLayoutProps = {
  children: ReactNode;       // right-column content (form + extras)
  marketing?: ReactNode;     // optional override for left panel
};
```

- Renders: `<div class="min-h-screen flex">` → left dark `<DefaultMarketingPanel />` (or `marketing`) → right column with a `mx-auto w-full sm:w-[350px]` container holding `children` → `<Notification />` mounted once
- `DefaultMarketingPanel` (internal, not exported) holds the current Acme Inc SVG logo + "John Doe" testimonial verbatim — visual parity with today's LoginPage
- All Tailwind classes preserved from the existing LoginPage

### Refactored `src/components/admin/login-page.tsx`

Shrinks to ~30 lines. Same submit handler, same form. Only the chrome moves into `<AuthLayout>`. No API change for consumers.

### `SupabaseLoginPage` + `SupabaseLoginForm`

`src/components/supabase/login-page.tsx`:

```ts
type SupabaseLoginPageProps = {
  children?: ReactNode;
  disableEmailPassword?: boolean;
  disableForgotPassword?: boolean;
  providers?: Provider[];    // from '@supabase/supabase-js'
  marketing?: ReactNode;     // pass-through to AuthLayout
};

SupabaseLoginPage.path = '/login';
```

Behavior:
- Wraps `<AuthLayout marketing={marketing}>`
- If `children` provided, renders them (full override)
- Else: `<SupabaseLoginForm disableForgotPassword={disableForgotPassword} />` when email enabled, optional `<Separator />`, then social buttons stack for each entry in `providers`
- `disableEmailPassword` hides the form entirely (social-only mode)

`src/components/supabase/login-form.tsx`:
- ra-core `<Form>` with email + password fields + submit
- Submit logic copies the kit's existing `LoginPage` submit handler verbatim (loading state, error notification)
- Renders a "Forgot password?" link below the form (translated, target `/forgot-password`) unless `disableForgotPassword`

### `ForgotPasswordPage` + `ForgotPasswordForm`

`forgot-password-page.tsx`:
- Wraps `<AuthLayout>` with `<ForgotPasswordForm />` as default child (override via `children`)
- Exports static `ForgotPasswordPage.path = '/forgot-password'` for route registration

`forgot-password-form.tsx`:
- Translated title ("Forgot password?") + body ("Enter your email…")
- ra-core `<Form>` with one required email field
- Submit calls `useResetPassword()` from `ra-supabase-core`, notifies on error using the same error-shape handling as the kit's existing LoginPage
- "Back to login page" link below the submit button

### `SetPasswordPage` + `SetPasswordForm`

`set-password-page.tsx`:
- Wraps `<AuthLayout>` with `<SetPasswordForm />` as default child
- Exports static `SetPasswordPage.path = '/set-password'`

`set-password-form.tsx`:
- Reads `access_token` and `refresh_token` from the URL hash via `useSupabaseAccessToken({ parameterName: ... })` from ra-supabase-core
- If either token missing: render translated error (`ra-supabase.auth.missing_tokens`) + `console.error` in dev mode
- Otherwise: `<Form>` with `password` + `confirmPassword` (both required, both `<PasswordInput>` equivalents)
- Custom validate fn: if values don't match, return `{ password: 'ra-supabase.validation.password_mismatch', confirmPassword: 'ra-supabase.validation.password_mismatch' }`
- Submit calls `useSetPassword().mutateAsync({ access_token, refresh_token, password })`
- Notifies on error matching ra-supabase's error-shape handling

### `SocialAuthButton` + 16 provider buttons

`src/components/supabase/social-auth-button.tsx`:

```ts
type SocialAuthButtonProps = {
  provider: Provider;
  redirect?: string;
} & React.ComponentProps<typeof Button>;
```

- Base `<SocialAuthButton>` calls `useLogin()({ provider }, redirect ?? window.location.toString())` on click
- Error handler matches ra-supabase's behavior: notify only if `error.message` exists (the auth provider rejects on all OAuth flows by design to prevent premature redirects)
- Renders shadcn `<Button variant="outline" className="w-full justify-start">` with the provider icon and translated label
- 16 named exports, one per provider (Apple, Azure, Bitbucket, Discord, Facebook, Github, Gitlab, Google, Keycloak, LinkedIn, Notion, Slack, Spotify, Twitch, Twitter, Workos), each pre-binding its icon + label via `translate('ra-supabase.auth.sign_in_with', { provider: 'Apple' })`

### `icons.tsx`

16 inline SVG components copied from `ra-supabase-ui-materialui/src/icons.tsx`. The MUI `<SvgIcon>` wrapper is replaced by a plain `<svg>` accepting `React.SVGProps<SVGSVGElement>` with sensible default `width="20" height="20"` props. Visual output preserved.

### Guessers — Supabase-aware variants

Distinct from the existing generic `src/components/admin/*-guesser.tsx` — exported under different names to avoid collision:

- `SupabaseListGuesser`
- `SupabaseShowGuesser`
- `SupabaseEditGuesser`
- `SupabaseCreateGuesser`
- `useCrudGuesser` (hook)

Each follows the ra-supabase structure: a `*Base` ra-core wrapper around a `*GuesserView` that:

1. Calls `useAPISchema()` from ra-supabase-core to fetch the Supabase OpenAPI document
2. Reads the current resource via `useResourceContext()`
3. Walks the resource's properties via `inferElementFromType()` to build an array of inferred elements
4. Renders the kit's existing view primitives (`<DataTable>` for list, `<Form>` + inputs for edit/create, `<RecordRepresentation>` + fields for show)
5. Logs the inferred admin source code to the console when `enableLog` is true (matching ra-supabase, lets devs graduate by copy/pasting)

**`inferred-element.ts`** — verbatim port. `class InferredElement extends CoreInferredElement` adds a `warning?: string` field with `getWarning()` accessor.

**`infer-element-from-type.ts`** — verbatim logic. Detects:
- `name === 'id'` → ID field
- `description.startsWith('Note:\nThis is a Foreign Key to ...')` → `<ReferenceInput>` with autocomplete child, parsing the referenced resource name and inferring `optionText` from name/title/label/reference
- `name.endsWith('_ids')` → `<ReferenceArrayInput>` with autocomplete array child
- `type === 'string'` with `name === 'email'` → email input
- `type === 'string'` with `name in ['url', 'website']` → url input
- `format` matches `'timestamp with time zone'`/`'timestamp without time zone'` → date input
- `type === 'integer'` → number input
- Falls back to the type map entry for the JSON-schema type, then `string`

**`edit-field-types.tsx`** — the only file with real porting work. ra-supabase imports `editFieldTypes as defaultEditFieldTypes` from `ra-ui-materialui`. We need:

1. Either reuse an `editFieldTypes` map already exposed by the kit's existing `src/components/admin/edit-guesser.tsx`, or define a complete `InferredTypeMap` inline pointing to shadcn-admin-kit's input components (`<TextInput>`, `<NumberInput>`, `<DateInput>`, `<BooleanInput>`, `<EmailField>`/`<EmailInput>` equivalents, etc. — verified against actual files in `src/components/admin/` during implementation).
2. Override 4 entries with PostgREST-aware variants:
   - `reference` → uses the kit's `<ReferenceInput>`
   - `autocompleteInput` → uses the kit's `<AutocompleteInput>` with `filterToQuery={searchText => ({ [`${optionText}@ilike`]: `%${searchText}%` })}`
   - `referenceArray` → kit's `<ReferenceArrayInput>`
   - `autocompleteArrayInput` → kit's `<AutocompleteArrayInput>` with the same `@ilike` filter

The `representation` property (used for console-log code generation) returns the JSX string for the user to copy.

A parallel `showFieldTypes` and `listFieldTypes` map is needed for `ShowGuesser` / `ListGuesser` — produced by reading the existing kit guessers to mirror their type maps.

**`use-crud-guesser.tsx`** — verbatim port. Returns `ResourceProps[]` whose entries reference `SupabaseListGuesser`/`SupabaseShowGuesser`/`SupabaseEditGuesser`/`SupabaseCreateGuesser` based on which OpenAPI verbs (`get`, `patch`, `post`) the resource exposes.

### `AdminGuesser` (umbrella)

`src/components/supabase/admin-guesser.tsx`. Wraps the kit's existing `<Admin>` component — not ra-core directly — to inherit theme, default layout, breadcrumb, and other kit-level wiring.

```ts
type AdminGuesserProps = AdminProps & {
  instanceUrl: string;
  apiKey: string;    // legacy anon key OR new sb_publishable_* key
};
```

Behavior:
- Memoizes `createClient(instanceUrl, apiKey)`
- Defaults `dataProvider` to `supabaseDataProvider({ instanceUrl, apiKey, supabaseClient })`
- Defaults `authProvider` to `supabaseAuthProvider(supabaseClient, {})`
- Defaults `i18nProvider` to `defaultSupabaseI18nProvider`
- Defaults `loginPage` to `<SupabaseLoginPage />`
- Renders `<Admin>` containing:
  - `<AdminGuesserResources>` (internal) — calls `useCrudGuesser()` and either renders provided `children` or auto-generates `<Resource>` elements
  - `<CustomRoutes noLayout>` registering `ForgotPasswordPage.path` and `SetPasswordPage.path`
- On first non-empty schema, logs the equivalent hand-written admin source to the console so devs can graduate from the guesser by copy/pasting

## i18n

Two language files mirroring `ra-supabase-language-english` / `-french`:

```ts
// src/components/supabase/i18n/en.ts
export default {
  'ra-supabase': {
    auth: {
      forgot_password: 'Forgot password?',
      back_to_login: 'Back to login page',
      sign_in_with: 'Sign in with %{provider}',
      missing_tokens: 'Could not find tokens to set your password. Please use the link you received by email.',
    },
    reset_password: {
      forgot_password: 'Forgot password?',
      forgot_password_details: 'Enter your email to receive a reset password link.',
    },
    set_password: {
      new_password: 'Choose your password',
    },
    validation: {
      password_mismatch: 'Passwords do not match',
    },
  },
};
```

(`fr.ts` mirrors the structure with French translations sourced from `ra-supabase-language-french`.)

All `translate()` calls in the components use the `_:` fallback form so the strings work even without these files loaded:

```ts
translate('ra-supabase.auth.forgot_password', { _: 'Forgot password?' });
```

`src/components/supabase/i18n/index.ts` exports a `defaultSupabaseI18nProvider` helper that polyglot-merges these keys with the kit's existing `defaultI18nProvider`. Used by `AdminGuesser` when no `i18nProvider` is passed.

## Testing strategy

Per `CLAUDE.md`:

- Co-located `*.spec.tsx` files next to components
- Tests import story exports from `src/stories/supabase/*.stories.tsx` and render them directly (no bespoke test wrappers)
- vitest-browser + Playwright (Chromium, headless by default)

Hook mocks via `vi.mock('ra-supabase-core', ...)` at the top of each spec file, factored into a shared `src/components/supabase/_test-utils.tsx` for reuse.

Per-component coverage:
- **LoginPage / LoginForm**: form renders, submit calls mocked `useLogin` with `{ email, password }`
- **ForgotPasswordForm**: mock `useResetPassword`, submit asserts `mutateAsync({ email })` called; error path renders notification
- **SetPasswordForm (with tokens)**: mock `useSupabaseAccessToken` → tokens, mock `useSetPassword`, mismatched passwords show validation error, matched passwords call `setPassword({ access_token, refresh_token, password })`
- **SetPasswordForm (missing tokens)**: mock returns `undefined` → translated error renders
- **SocialAuthButton**: click → `useLogin({ provider }, redirect)` called
- **Guessers**: mock `useAPISchema()` to return `__fixtures__/example-schema.json`, assert inferred elements render (FK → ReferenceInput, `_ids` → ReferenceArrayInput, timestamps → date fields, etc.)
- **AdminGuesser**: mock `createClient` + `useAPISchema`, assert `<Resource>` elements for each schema entry, assert `/forgot-password` and `/set-password` routes resolve

## Storybook

One `*.stories.tsx` per component in `src/stories/supabase/`. Stories needing Supabase context wire up `_mocks.ts` decorators reusing the same hook mocks the specs use.

`LoginPage` stories: default, with-providers, social-only (`disableEmailPassword`), no-forgot-password, custom-marketing-panel.

Guesser stories: drive `useAPISchema` mock with the fixture schema; show inferred output for a sample resource.

## Documentation

Each public component gets a Markdown page in `docs/src/content/docs/supabase/` following the kit's Usage → Props → per-prop sections pattern.

Additionally:
- `docs/src/content/docs/supabase/getting-started.md` — peer-dep install instructions, minimal `<AdminGuesser instanceUrl={...} apiKey={...} />` example, link to upstream `ra-supabase-core` docs for advanced data/auth provider configuration
- `docs/src/content/docs/supabase/i18n.md` — how to merge the supplied translations, list of all `ra-supabase.*` keys
- Astro nav config gets a new "Supabase" section

## Migration / compatibility notes

- **No breaking changes for existing kit users.** The `AuthLayout` extraction from `login-page.tsx` preserves the public API and visual output of the existing `LoginPage`.
- **For users porting from ra-supabase**: the public API mirrors upstream closely. Major differences: import paths (`@/components/supabase/*` vs `ra-supabase-ui-materialui`), component naming (`SupabaseListGuesser` vs `ListGuesser` to avoid the kit's existing generic guesser), shadcn-flavored visuals.
- **Bundle impact for non-Supabase users**: zero — these are opt-in registry components with peer-dep installation. The main bundle is untouched.

## Open questions deferred to implementation

These do not require user input but will be resolved during implementation:

1. Whether the kit's existing `src/components/admin/edit-guesser.tsx` already exposes a reusable `editFieldTypes` map. If yes, extend it. If not, define inline in `src/components/supabase/edit-field-types.tsx`. Inspect during implementation.
2. Exact component names for the kit's password input and email input (verified against `src/components/admin/` during implementation — likely `<TextInput type="password">` rather than a dedicated `<PasswordInput>`).
3. Whether `<Separator>` already exists in `src/components/ui/`. If not, add via `shadcn add separator`.
