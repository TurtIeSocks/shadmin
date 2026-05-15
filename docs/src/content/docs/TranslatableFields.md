---
title: "TranslatableFields"
---

`<TranslatableFields>` lets you display the same field in several languages, exposing one tab per locale. It is the read-only counterpart of [`<TranslatableInputs>`](./TranslatableInputs.md).

## Usage

`<TranslatableFields>` expects translatable values to be stored as an object keyed by locale. Given a record like:

```js
{
    id: 123,
    name: {
        en: "Welcome",
        fr: "Bienvenue",
        tlh: "nuqneH"
    },
    description: {
        en: "A friendly greeting",
        fr: "Une salutation amicale",
        tlh: "qoH neH"
    }
}
```

Render translatable fields by passing `locales` and one child per source:

```jsx
import { TranslatableFields, TextField } from "@/components/admin";

const PostShow = () => (
  <Show>
    <TranslatableFields locales={["en", "fr", "tlh"]}>
      <TextField source="name" />
      <TextField source="description" />
    </TranslatableFields>
  </Show>
);
```

Children read from a fresh `RecordContext` filtered to the active locale, and a `SourceContext` rewrites their `source` prop automatically — so `<TextField source="name" />` renders `record.name.en`, `record.name.fr`, etc. depending on the selected tab.

## Props

| Prop            | Required | Type           | Default                      | Description                                                                                                                                      |
| --------------- | -------- | -------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `locales`       | Required | `string[]`     | -                            | The list of supported locales (e.g. `['en', 'fr']`).                                                                                             |
| `children`      | Required | `ReactNode`    | -                            | One or more field components reading from a translatable source.                                                                                 |
| `defaultLocale` | Optional | `string`       | `'en'`                       | The locale selected initially.                                                                                                                   |
| `selector`      | Optional | `ReactElement` | `<TranslatableFieldsTabs />` | Custom locale selector.                                                                                                                          |
| `groupKey`      | Optional | `string`       | `''`                         | Prefix used when looking up tab labels (`ra.locales.${groupKey}${locale}`). Useful when nesting several `<TranslatableFields>` on the same page. |
| `className`     | Optional | `string`       | -                            | Class names applied to the outer container.                                                                                                      |
| `record`        | Optional | `RaRecord`     | From context                 | Source record. Falls back to the current `RecordContext`.                                                                                        |
| `resource`      | Optional | `string`       | From context                 | Resource name. Falls back to the current `ResourceContext`.                                                                                      |

`<TranslatableFields>` must be used inside a `RecordContext` and a `ResourceContext`, or you must pass `record` and `resource` explicitly — it throws otherwise.

## Tab labels

By default each tab is labeled by translating the key `ra.locales.${groupKey}${locale}`. If the key does not exist in the active i18n messages, the locale code is capitalized (e.g. `en` → `En`). You can add custom labels via your `i18nProvider`:

```js
// ra-i18n-polyglot messages
{
    ra: {
        locales: {
            en: "English",
            fr: "French",
            tlh: "Klingon",
        }
    }
}
```

## Custom selector

Pass any React element as the `selector` prop to replace the default tabs. Use `useTranslatableContext` to read and update the currently selected locale:

```jsx
import { useTranslatableContext } from "ra-core";
import { TranslatableFields, TextField } from "@/components/admin";

const LocaleSelector = () => {
  const { locales, selectedLocale, selectLocale } = useTranslatableContext();
  return (
    <select
      value={selectedLocale}
      onChange={(e) => selectLocale(e.target.value)}
    >
      {locales.map((locale) => (
        <option key={locale} value={locale}>
          {locale}
        </option>
      ))}
    </select>
  );
};

const PostShow = () => (
  <Show>
    <TranslatableFields
      locales={["en", "fr", "tlh"]}
      selector={<LocaleSelector />}
    >
      <TextField source="name" />
    </TranslatableFields>
  </Show>
);
```

## Composing the parts

`<TranslatableFields>` is built from three smaller components that you can use directly when you need fine-grained control.

### `<TranslatableFieldsTabs>`

The default locale selector. Reads the list of locales from `TranslatableContext` and renders one `<TranslatableFieldsTab>` per locale, wrapped in a shadcn `<TabsList>`.

| Prop        | Required | Type     | Default | Description                                  |
| ----------- | -------- | -------- | ------- | -------------------------------------------- |
| `groupKey`  | Optional | `string` | `''`    | Forwarded to each `<TranslatableFieldsTab>`. |
| `className` | Optional | `string` | -       | Extra classes on the `<TabsList>`.           |

### `<TranslatableFieldsTab>`

A single tab. Renders as a shadcn `<TabsTrigger value={locale}>` and labels itself by translating `ra.locales.${groupKey}${locale}`, falling back to the capitalized locale code.

| Prop       | Required | Type     | Default | Description                  |
| ---------- | -------- | -------- | ------- | ---------------------------- |
| `locale`   | Required | `string` | -       | The locale this tab selects. |
| `groupKey` | Optional | `string` | `''`    | Prefix used in the i18n key. |

Inherits all other props from `<TabsTrigger>`.

### `<TranslatableFieldsTabContent>`

A single panel. Provides:

- a `RecordContext` filtered to the current locale (e.g. `{ name: { en, fr } }` becomes `{ name: <value for locale> }`),
- a `SourceContext` that rewrites every child's `source` prop from `path` to `path.${locale}`.

It is wrapped in a shadcn `<TabsContent>` with `forceMount` so each panel stays mounted (the inactive ones are hidden via `data-state`).

| Prop        | Required | Type        | Default      | Description                                 |
| ----------- | -------- | ----------- | ------------ | ------------------------------------------- |
| `locale`    | Required | `string`    | -            | The locale this panel represents.           |
| `record`    | Required | `RaRecord`  | -            | The translatable record.                    |
| `children`  | Required | `ReactNode` | -            | Fields to render for this locale.           |
| `groupKey`  | Optional | `string`    | `''`         | Prefix for the ARIA `id`/`aria-labelledby`. |
| `resource`  | Optional | `string`    | From context | Resource name used to infer default labels. |
| `className` | Optional | `string`    | -            | Extra classes on the `<TabsContent>`.       |

> Note: when more than one child is passed, each one is prefixed by a small inline label derived from its `source`. This is a deviation from the upstream `ra-ui-materialui` implementation, which uses MUI's `<Labeled>` component (no equivalent exists in this kit).
