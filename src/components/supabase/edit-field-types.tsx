/* eslint-disable @typescript-eslint/no-explicit-any */
import type { InferredTypeMap } from "ra-core";
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
export const editFieldTypes: InferredTypeMap = {
  form: {
    component: (props: any) => <SimpleForm {...props} />,
    representation: (
      _props: any,
      children: { getRepresentation: () => string }[],
    ) => `        <SimpleForm>
${children
  .map((child) => `            ${child.getRepresentation()}`)
  .join("\n")}
        </SimpleForm>`,
  },
  reference: {
    component: (props: any) => <ReferenceInput {...props} />,
    representation: (
      props: any,
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
    component: (props: any) =>
      props.optionText ? (
        <AutocompleteInput
          {...props}
          filterToQuery={ilikeFilter(props.optionText)}
        />
      ) : (
        <AutocompleteInput {...props} />
      ),
    representation: (props: any) =>
      `<AutocompleteInput${props.source ? ` source="${props.source}"` : ""}${
        props.optionText
          ? ` optionText="${props.optionText}" filterToQuery={searchText => ({ '${props.optionText}@ilike': \`%\${searchText}%\` })}`
          : ""
      } />`,
  },
  referenceArray: {
    component: (props: any) => <ReferenceArrayInput {...props} />,
    representation: (
      props: any,
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
    component: (props: any) =>
      props.optionText ? (
        <AutocompleteArrayInput
          {...props}
          filterToQuery={ilikeFilter(props.optionText)}
        />
      ) : (
        <AutocompleteArrayInput {...props} />
      ),
    representation: (props: any) =>
      `<AutocompleteArrayInput${
        props.source ? ` source="${props.source}"` : ""
      }${
        props.optionText
          ? ` optionText="${props.optionText}" filterToQuery={searchText => ({ '${props.optionText}@ilike': \`%\${searchText}%\` })}`
          : ""
      } />`,
  },
  number: {
    component: (props: any) => <NumberInput {...props} />,
    representation: (props: any) => `<NumberInput source="${props.source}" />`,
  },
  boolean: {
    component: (props: any) => <BooleanInput {...props} />,
    representation: (props: any) => `<BooleanInput source="${props.source}" />`,
  },
  date: {
    component: (props: any) => <DateInput {...props} />,
    representation: (props: any) => `<DateInput source="${props.source}" />`,
  },
  email: {
    component: (props: any) => <TextInput {...props} type="email" />,
    representation: (props: any) =>
      `<TextInput source="${props.source}" type="email" />`,
  },
  url: {
    component: (props: any) => <TextInput {...props} type="url" />,
    representation: (props: any) =>
      `<TextInput source="${props.source}" type="url" />`,
  },
  string: {
    component: (props: any) => <TextInput {...props} />,
    representation: (props: any) => `<TextInput source="${props.source}" />`,
  },
};
