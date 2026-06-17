import type { InferredTypeMap } from "shadmin-core";
import type { Any } from "@/lib/any";
import { SimpleForm } from "@/components/admin/simple-form";
import { TextInput } from "@/components/admin/text-input";
import { NumberInput } from "@/components/admin/number-input";
import { BooleanInput } from "@/components/admin/boolean-input";
import { DateInput } from "@/components/admin/date-input";
import { ReferenceInput } from "@/components/admin/reference-input";
import { ReferenceArrayInput } from "@/components/admin/reference-array-input";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import { AutocompleteArrayInput } from "@/components/admin/autocomplete-array-input";

const ilikeFilter = (optionText: string) => (searchText: string) => ({
  [`${optionText}@ilike`]: `%${searchText}%`,
});

/**
 * Input-component map for `inferElementFromType` in the Create/Edit
 * guessers. PostgREST-aware: `autocompleteInput` and
 * `autocompleteArrayInput` use the `@ilike` operator that
 * Supabase's REST API understands.
 */
const editFieldTypes: InferredTypeMap = {
  form: {
    component: (props: Any) => <SimpleForm {...props} />,
    representation: (
      _props: Any,
      children: { getRepresentation: () => string }[],
    ) => `        <SimpleForm>
${children
  .map((child) => `            ${child.getRepresentation()}`)
  .join("\n")}
        </SimpleForm>`,
  },
  reference: {
    component: (props: Any) => <ReferenceInput {...props} />,
    representation: (
      props: Any,
      children?: { getRepresentation: () => string }[],
    ) =>
      children
        ? `<ReferenceInput source="${props.source}" reference="${props.reference}">
${children
  .map((child) => `                ${child.getRepresentation()}`)
  .join("\n")}
            </ReferenceInput>`
        : `<ReferenceInput source="${props.source}" reference="${props.reference}" />`,
  },
  autocompleteInput: {
    component: (props: Any) =>
      props.optionText ? (
        <AutocompleteInput
          {...props}
          filterToQuery={ilikeFilter(props.optionText)}
        />
      ) : (
        <AutocompleteInput {...props} />
      ),
    representation: (props: Any) =>
      `<AutocompleteInput${props.source ? ` source="${props.source}"` : ""}${
        props.optionText
          ? ` optionText="${props.optionText}" filterToQuery={searchText => ({ '${props.optionText}@ilike': \`%\${searchText}%\` })}`
          : ""
      } />`,
  },
  referenceArray: {
    component: (props: Any) => <ReferenceArrayInput {...props} />,
    representation: (
      props: Any,
      children?: { getRepresentation: () => string }[],
    ) =>
      children
        ? `<ReferenceArrayInput source="${props.source}" reference="${props.reference}">
${children
  .map((child) => `                ${child.getRepresentation()}`)
  .join("\n")}
            </ReferenceArrayInput>`
        : `<ReferenceArrayInput source="${props.source}" reference="${props.reference}" />`,
  },
  autocompleteArrayInput: {
    component: (props: Any) =>
      props.optionText ? (
        <AutocompleteArrayInput
          {...props}
          filterToQuery={ilikeFilter(props.optionText)}
        />
      ) : (
        <AutocompleteArrayInput {...props} />
      ),
    representation: (props: Any) =>
      `<AutocompleteArrayInput${
        props.source ? ` source="${props.source}"` : ""
      }${
        props.optionText
          ? ` optionText="${props.optionText}" filterToQuery={searchText => ({ '${props.optionText}@ilike': \`%\${searchText}%\` })}`
          : ""
      } />`,
  },
  number: {
    component: (props: Any) => <NumberInput {...props} />,
    representation: (props: Any) => `<NumberInput source="${props.source}" />`,
  },
  boolean: {
    component: (props: Any) => <BooleanInput {...props} />,
    representation: (props: Any) => `<BooleanInput source="${props.source}" />`,
  },
  date: {
    component: (props: Any) => <DateInput {...props} />,
    representation: (props: Any) => `<DateInput source="${props.source}" />`,
  },
  email: {
    component: (props: Any) => <TextInput {...props} type="email" />,
    representation: (props: Any) =>
      `<TextInput source="${props.source}" type="email" />`,
  },
  url: {
    component: (props: Any) => <TextInput {...props} type="url" />,
    representation: (props: Any) =>
      `<TextInput source="${props.source}" type="url" />`,
  },
  string: {
    component: (props: Any) => <TextInput {...props} />,
    representation: (props: Any) => `<TextInput source="${props.source}" />`,
  },
};

export { editFieldTypes };
