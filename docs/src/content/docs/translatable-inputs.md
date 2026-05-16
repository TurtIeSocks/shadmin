---
title: "TranslatableInputs"
---

`<TranslatableInputs>` lets you edit the same input in several languages, exposing one tab per locale. It is the editable counterpart of [`<TranslatableFields>`](./translatable-fields).

## Usage

`<TranslatableInputs>` expects translatable values to be stored as an object keyed by locale. Given a record like:

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

Render translatable inputs by passing `locales` and one child per source:

```jsx
import { TranslatableInputs, TextInput } from "@/components/admin";

const PostEdit = () => (
  <Edit>
    <SimpleForm>
      <TranslatableInputs locales={["en", "fr", "tlh"]}>
        <TextInput source="name" />
        <TextInput source="description" multiline />
      </TranslatableInputs>
    </SimpleForm>
  </Edit>
);
```

A `SourceContext` rewrites every child's `source` prop automatically — `<TextInput source="name" />` writes to `record.name.en`, `record.name.fr`, etc. depending on the selected tab. All tabs stay mounted while editing, so the user can switch locales without losing pending changes.

## Props

| Prop            | Required | Type           | Default                      | Description                                                                                                           |
| --------------- | -------- | -------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `locales`       | Required | `string[]`     | -                            | The list of supported locales (e.g. `['en', 'fr']`).                                                                  |
| `children`      | Required | `ReactNode`    | -                            | One or more input components reading from a translatable source.                                                      |
| `defaultLocale` | Optional | `string`       | `'en'`                       | The locale selected initially.                                                                                        |
| `selector`      | Optional | `ReactElement` | `<TranslatableInputsTabs />` | Custom locale selector.                                                                                               |
| `groupKey`      | Optional | `string`       | `''`                         | Prefix used for tab labels and form group names. Useful when several `<TranslatableInputs>` coexist on the same form. |
| `fullWidth`     | Optional | `boolean`      | `false`                      | Forces the container to take the full available width.                                                                |
| `className`     | Optional | `string`       | -                            | Class names applied to the outer container.                                                                           |

## Tab labels

By default each tab is labeled by translating the key `ra.locales.${locale}`. If the key does not exist in the active i18n messages, the locale code is capitalized (e.g. `en` → `En`). You can add custom labels via your `i18nProvider`:

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

## Validation per locale

Each tab subscribes to a form group named `${groupKey}${locale}` via `useFormGroup`. When that group contains invalid inputs, the tab label is rendered in the `text-destructive` color so the user can quickly spot which locale needs attention.

```jsx
import { required } from "ra-core";
import { TranslatableInputs, TextInput } from "@/components/admin";

<TranslatableInputs locales={["en", "fr"]}>
  <TextInput source="name" validate={required()} />
</TranslatableInputs>;
```

When the user submits the form leaving `name.fr` empty, the `fr` tab label turns red.

## Custom selector

Pass any React element as the `selector` prop to replace the default tabs. Use `useTranslatableContext` to read and update the currently selected locale:

```jsx
import { useTranslatableContext } from "ra-core";
import { TranslatableInputs, TextInput } from "@/components/admin";

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

const PostEdit = () => (
  <Edit>
    <SimpleForm>
      <TranslatableInputs
        locales={["en", "fr", "tlh"]}
        selector={<LocaleSelector />}
      >
        <TextInput source="name" />
      </TranslatableInputs>
    </SimpleForm>
  </Edit>
);
```

## Composing the parts

`<TranslatableInputs>` is built from three smaller components that you can use directly when you need fine-grained control.

### `<TranslatableInputsTabs>`

The default locale selector. Reads the list of locales from `TranslatableContext` and renders one `<TranslatableInputsTab>` per locale, wrapped in a shadcn `<TabsList>`.

| Prop        | Required | Type     | Default | Description                                  |
| ----------- | -------- | -------- | ------- | -------------------------------------------- |
| `groupKey`  | Optional | `string` | `''`    | Forwarded to each `<TranslatableInputsTab>`. |
| `className` | Optional | `string` | -       | Extra classes on the `<TabsList>`.           |

### `<TranslatableInputsTab>`

A single tab. Renders as a shadcn `<TabsTrigger value={locale}>` and labels itself by translating `ra.locales.${locale}`, falling back to the capitalized locale code. Subscribes to the `${groupKey}${locale}` form group via `useFormGroup` and applies the `text-destructive` class when the group is invalid.

| Prop       | Required | Type     | Default | Description                          |
| ---------- | -------- | -------- | ------- | ------------------------------------ |
| `locale`   | Required | `string` | -       | The locale this tab selects.         |
| `groupKey` | Optional | `string` | `''`    | Prefix used for the form group name. |

Inherits all other props from `<TabsTrigger>`.

### `<TranslatableInputsTabContent>`

A single panel. Provides:

- a `FormGroupContextProvider` named `${groupKey}${locale}` so `<TranslatableInputsTab>` can read its validation state,
- a `SourceContext` that rewrites every child's `source` prop from `path` to `path.${locale}`,
- a `RecordContext` filtered to the current locale (so React Hook Form's `defaultValues` resolve to the right values).

It is wrapped in a shadcn `<TabsContent>` with `forceMount` so each panel stays mounted (the inactive ones are hidden via `data-state`). This preservation is critical: it ensures pending edits in one locale survive a tab switch.

| Prop        | Required | Type        | Default      | Description                                                 |
| ----------- | -------- | ----------- | ------------ | ----------------------------------------------------------- |
| `locale`    | Required | `string`    | -            | The locale this panel represents.                           |
| `children`  | Required | `ReactNode` | -            | Inputs to render for this locale.                           |
| `groupKey`  | Optional | `string`    | `''`         | Prefix for the form group name and ARIA `id`.               |
| `record`    | Optional | `RaRecord`  | From context | Source record. Falls back to the current `RecordContext`.   |
| `resource`  | Optional | `string`    | From context | Resource name. Falls back to the current `ResourceContext`. |
| `className` | Optional | `string`    | -            | Extra classes on the `<TabsContent>`.                       |
