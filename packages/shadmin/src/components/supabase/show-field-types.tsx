import type { InferredTypeMap } from "shadmin-core";
import type { Any } from "@/lib/any";
import { RecordField } from "@/components/admin/fields/record-field";
import { DateField } from "@/components/admin/fields/date-field";
import { NumberField } from "@/components/admin/fields/number-field";
import { EmailField } from "@/components/admin/fields/email-field";
import { UrlField } from "@/components/admin/fields/url-field";
import { ReferenceField } from "@/components/admin/fields/reference-field";
import { ReferenceArrayField } from "@/components/admin/fields/reference-array-field";

/**
 * Field-component map for the Supabase Show guesser.
 */
const showFieldTypes: InferredTypeMap = {
  show: {
    component: (props: Any) => (
      <div className="flex flex-col gap-4">{props.children}</div>
    ),
    representation: (
      _props: Any,
      children: { getRepresentation: () => string }[],
    ) => `        <div className="flex flex-col gap-4">
${children
  .map((child) => `            ${child.getRepresentation()}`)
  .join("\n")}
        </div>`,
  },
  reference: {
    component: (props: Any) => (
      <RecordField source={props.source}>
        <ReferenceField source={props.source} reference={props.reference} />
      </RecordField>
    ),
    representation: (props: Any) =>
      `<RecordField source="${props.source}">
                <ReferenceField source="${props.source}" reference="${props.reference}" />
            </RecordField>`,
  },
  referenceArray: {
    component: (props: Any) => (
      <RecordField source={props.source}>
        <ReferenceArrayField
          source={props.source}
          reference={props.reference}
        />
      </RecordField>
    ),
    representation: (props: Any) =>
      `<RecordField source="${props.source}">
                <ReferenceArrayField source="${props.source}" reference="${props.reference}" />
            </RecordField>`,
  },
  date: {
    component: (props: Any) => (
      <RecordField source={props.source}>
        <DateField source={props.source} />
      </RecordField>
    ),
    representation: (props: Any) =>
      `<RecordField source="${props.source}">
                <DateField source="${props.source}" />
            </RecordField>`,
  },
  number: {
    component: (props: Any) => (
      <RecordField source={props.source}>
        <NumberField source={props.source} />
      </RecordField>
    ),
    representation: (props: Any) =>
      `<RecordField source="${props.source}">
                <NumberField source="${props.source}" />
            </RecordField>`,
  },
  email: {
    component: (props: Any) => (
      <RecordField source={props.source}>
        <EmailField source={props.source} />
      </RecordField>
    ),
    representation: (props: Any) =>
      `<RecordField source="${props.source}">
                <EmailField source="${props.source}" />
            </RecordField>`,
  },
  url: {
    component: (props: Any) => (
      <RecordField source={props.source}>
        <UrlField source={props.source} />
      </RecordField>
    ),
    representation: (props: Any) =>
      `<RecordField source="${props.source}">
                <UrlField source="${props.source}" />
            </RecordField>`,
  },
  string: {
    component: (props: Any) => <RecordField source={props.source} />,
    representation: (props: Any) => `<RecordField source="${props.source}" />`,
  },
};

export { showFieldTypes };
