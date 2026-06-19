---
title: "I18nKeyEditor"
---

Wraps an i18n provider so every missing-key lookup is captured and surfaced
in a floating panel. Inline-edit translations; Export emits a JSON patch to
the clipboard.

## Usage

```tsx
import { Admin, I18nKeyEditor, Resource } from "@/components/admin";

const App = () => (
  <Admin dataProvider={myDataProvider} i18nProvider={myI18n}>
    <I18nKeyEditor baseProvider={myI18n}>
      <Resource name="posts" />
    </I18nKeyEditor>
  </Admin>
);
```

## Props

| Prop           | Required | Type           | Default | Description          |
| -------------- | -------- | -------------- | ------- | -------------------- |
| `children`     | Required | `ReactNode`    | -       | Tree to track        |
| `baseProvider` | Required | `I18nProvider` | -       | Original provider    |
| `defaultOpen`  | Optional | `boolean`      | `true`  | Panel state at mount |
| `showExport`   | Optional | `boolean`      | `true`  | Show Export button   |

## Detection mechanism

A key is "missing" when `baseProvider.translate(key)` returns the literal key.
That requires the provider to support `allowMissing: true` (the polyglot
default). Translated keys are not captured.

## Limitations

- v1 only captures via `useTranslate()` calls; direct
  `i18nProvider.translate(...)` invocations are not observable through React
  context.
- No filesystem write — export is clipboard-only.
