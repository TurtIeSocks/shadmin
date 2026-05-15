---
title: "Migrating from ra-ui-materialui"
---

Shadcn Admin Kit re-implements the UI surface of [`ra-ui-materialui`](https://marmelab.com/react-admin/) on top of shadcn/ui primitives while reusing
[`ra-core`](https://marmelab.com/react-admin/) for headless logic (data, auth, routing, i18n, state). Most upstream APIs translate directly: the
hooks are unchanged and component prop names are preserved whenever possible. This page documents the additions and intentional deviations made
during the Phase 2 port.

If you are coming from `react-admin` / `ra-ui-materialui`, the short version is:

- **Hooks**: identical — `useListContext`, `useRecordContext`, `useInput`, `usePreferencesEditor`, `useTranslate`, etc. are all re-exported from
  `ra-core` and behave the same.
- **Components**: same names, same prop shapes most of the time. Some MUI-specific props (e.g. `sx`, `slotProps`, MUI theme overrides) have no
  equivalent — see the per-component notes below.
- **Themes**: instead of MUI theme objects, shadcn-admin-kit themes are plain objects mapping CSS custom property names to
  [oklch](https://oklch.com) values. They are applied at runtime via `documentElement.style.setProperty(...)`.
- **Imports**: every component is exported as a named export from `@/components/admin`.

## Phase 2 additions

Phase 2 brought roughly thirty new components plus theme infrastructure to reach parity with `ra-ui-materialui`'s most commonly used surfaces.
Components are grouped below by area.

### 1. Translatable family

Components added: `TranslatableFields`, `TranslatableFieldsTab`, `TranslatableFieldsTabContent`, `TranslatableFieldsTabs`, `TranslatableInputs`,
`TranslatableInputsTab`, `TranslatableInputsTabContent`, `TranslatableInputsTabs`.

These mirror the upstream `<TranslatableFields>` / `<TranslatableInputs>` APIs and accept the same `locales`, `defaultLocale`, `groupKey`
and `selector` props.

**Key differences**:

- The tab UI is built on top of Radix UI `Tabs` (via `@/components/ui/tabs`) rather than `@mui/material/Tabs`. Tab content panels mount with
  `forceMount` so every locale's form state is preserved as users switch tabs — matching the upstream behaviour even though Radix's default is
  to unmount inactive tabs.
- The default `<TranslatableFieldsTabContent>` renders an inline `<label>` above each field instead of wrapping children in the upstream
  `<Labeled>` component. Shadcn Admin Kit does not ship `<Labeled>`, since field components handle their own label rendering, so the inline label
  is the simplest way to keep visual parity.

```tsx
import { TranslatableInputs, TextInput } from "@/components/admin";

<TranslatableInputs locales={["en", "fr"]} defaultLocale="en">
  <TextInput source="title" />
  <TextInput source="description" multiline />
</TranslatableInputs>;
```

### 2. Themes

Components added: `defaultTheme`, `bwTheme`, `nanoTheme`, `radiantTheme`, `houseTheme`, plus `ThemesContext`, `useThemesContext` and the
`AdminTheme` type.

**Key difference**: shadcn-admin-kit themes are plain JS objects mapping CSS variable names → oklch values, applied at runtime by
`<ThemeProvider>` via `documentElement.style.setProperty(...)`. They do not contain MUI-specific component overrides. Where the upstream
`ra-ui-materialui` themes could re-style individual MUI components, shadcn themes are limited to the palette + border radius. Differences
in component appearance across themes are therefore confined to colours and corner radii.

```tsx
import { Admin, radiantTheme } from "@/components/admin";

<Admin dataProvider={dataProvider} theme={radiantTheme}>
  {/* ... */}
</Admin>;
```

See the [Themes](./themes/) page for the full catalogue and the `AdminTheme` shape.

### 3. Preferences / Inspector

Components added: `Configurable`, `Inspector`, `InspectorRoot`, `InspectorButton`, `FieldsSelector`, `SimpleFormConfigurable`.

These compose the same way as their upstream counterparts: wrap a piece of UI in `<Configurable>` and provide an `editor`, then mount an
`<Inspector>` somewhere in the layout and let `<InspectorButton>` toggle edit mode. Persistence still flows through `ra-core`'s preferences
store, so `usePreference`, `usePreferenceKey` and friends work without changes.

**Key difference**: the Inspector panel is pinned to the top-right corner of the viewport. The upstream MUI `<Inspector>` is a draggable
dialog whose position is persisted in the store; that complexity is intentionally omitted here. If you relied on the drag-to-reposition
behaviour upstream, you'll need to provide it yourself by overriding the `<Inspector>` component.

```tsx
import { Admin, Inspector, InspectorButton } from "@/components/admin";

<Admin dataProvider={dataProvider}>
  <Inspector />
  {/* InspectorButton goes in your AppBar / Layout */}
</Admin>;
```

### 4. Specialized inputs

Components added: `InPlaceEditor`, `DatagridInput`, `LoadingInput`.

- `<InPlaceEditor>` matches the upstream component — click a field in a list/show context to swap it for an inline form, save on blur.
- `<DatagridInput>` is a work in progress and mirrors the upstream API (a checkbox-selectable table that emits an array of selected ids on form
  submit). Behaviour parity is close but not yet complete; expect this component to evolve.
- `<LoadingInput>` is the low-level skeleton-shaped placeholder used by inputs while their data is loading. Renders nothing fancy — a label slot
  and a flat `<Skeleton>`-style block sized like a real input.

### 5. Auth pages

Components added: `AuthCallback`, `AuthError`, `AuthLayout`, `LoginForm`, `LoginWithEmail`.

The shape of these mirrors upstream, with a couple of refactors:

- `<LoginPage>` is now a thin composition of `<AuthLayout>` + `<LoginForm>`. Anything you can do with the upstream `<Login>` page you can do by
  composing your own page from `<AuthLayout>` + `<LoginForm>` (or your own form).
- `<AuthCallback>` and `<AuthError>` were extracted out of `authentication.tsx` into their own files. The original
  `@/components/admin/authentication` module now re-exports both for backward compatibility, so existing imports keep working:

  ```ts
  // Both of these still work:
  import { AuthCallback, AuthError } from "@/components/admin/authentication";
  import { AuthCallback } from "@/components/admin/auth-callback";
  ```

- `<LoginWithEmail>` is a minimal form for passwordless / magic-link flows. It calls `authProvider.login({ email })` and shows a success
  message.

### 6. PWA — application updates and offline detection

Components added: `CheckForApplicationUpdate`, `ApplicationUpdatedNotification`, `Offline`.

- `<CheckForApplicationUpdate>` polls the current HTML document at a configurable interval and computes a sync **djb2-based content hash**
  on each response. When the hash changes, it shows `<ApplicationUpdatedNotification>` to prompt the user to reload. The upstream MUI version
  uses the same conceptual approach; the hashing strategy is identical in spirit (cheap, sync, no crypto) and a fully drop-in replacement at
  the prop level.
- `<Offline>` listens to `navigator.onLine` plus the browser `online` / `offline` events and renders its children when the user is offline.
  This is a lighter implementation than the upstream Service-Worker-aware variant — it does not consult the SW's `controller`. Pure online/offline
  signal only.

### 7. Misc atoms

Small primitives needed by the page-level components above. These are intentionally low-API:

`KeyboardShortcut`, `AccessDenied`, `AuthenticationError`, `HideOnScroll`, `LinearProgress`, `LoadingPage`, `CardContentInner`,
`DeviceTestWrapper`, `Placeholder`, `ReferenceError`.

If you have customisations that depend on upstream MUI-specific atoms (`<LinearProgress>`'s MUI props, `<HideOnScroll>` mounted around an
`<AppBar>`, etc.), expect minor rewrites — they accept the same intent but the prop surface is shadcn-flavoured and the underlying DOM is
different.

### 8. DataTable internals

Components added: `DataTableRoot`, `DataTableHead`, `DataTableBody`, `DataTableRow`, `DataTableHeadCell`, `DataTableCell`, `DataTableEmpty`,
`DataTableLoading`, `SelectPageCheckbox`, `SelectRowCheckbox`.

All **additive**. The public API of `<DataTable>` is unchanged — you can keep using it exactly as before. These exports exist so consumers
who want to drop down a level (custom row rendering, replacing the empty/loading state, building a non-standard layout) have the same building
blocks the default `<DataTable>` does. This matches the upstream `<Datagrid>` story where `<DatagridHeaderCell>` etc. are public.

## Conventions

A handful of project-wide conventions apply to every component listed above:

- **File names are kebab-case**. The component `TranslatableFieldsTab` lives in `translatable-fields-tab.tsx`. The upstream MUI convention of
  PascalCase file names was dropped to match the shadcn ecosystem.
- **Named exports only**. There is no `export default` anywhere in `src/components/admin/`. Import with curly braces:

  ```ts
  import { TranslatableInputs, Inspector } from "@/components/admin";
  ```

- **JSDoc on every public component** with at least one `@example` block and a `@see` link back to the docs page. This drives the in-IDE tooltip
  experience for consumers, and the `@see` links are the bridge between the source and the published documentation.
- **No `@mui/*` imports anywhere**. The codebase has zero remaining MUI runtime dependencies — anything that previously came from
  `@mui/material`, `@mui/icons-material`, `@mui/lab` or `@mui/x-*` is reimplemented with shadcn/ui primitives plus `lucide-react` icons.

If you spot a Phase 2 component whose behaviour diverges from its upstream counterpart in a way that isn't documented here, please open an issue
— deviations should be intentional and documented.
