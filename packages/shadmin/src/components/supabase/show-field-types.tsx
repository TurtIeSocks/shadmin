import type { InferredTypeMap } from "ra-core";
import { RecordField } from "@/components/admin/record-field";
import { DateField } from "@/components/admin/date-field";
import { NumberField } from "@/components/admin/number-field";
import { EmailField } from "@/components/admin/email-field";
import { UrlField } from "@/components/admin/url-field";
import { ReferenceField } from "@/components/admin/reference-field";
import { ReferenceArrayField } from "@/components/admin/reference-array-field";

/**
 * Field-component map for the Supabase Show guesser.
 */
const showFieldTypes: InferredTypeMap = {
  show: {
    component: (props: any) => (
      <div className="flex flex-col gap-4">{props.children}</div>
    ),
    representation: (
      _props: any,
      children: { getRepresentation: () => string }[],
    ) => `        <div className="flex flex-col gap-4">
${children
  .map((child) => `            ${child.getRepresentation()}`)
  .join("\n")}
        </div>`,
  },
  reference: {
    component: (props: any) => (
      <RecordField source={props.source}>
        <ReferenceField source={props.source} reference={props.reference} />
      </RecordField>
    ),
    representation: (props: any) =>
      `<RecordField source="${props.source}">
                <ReferenceField source="${props.source}" reference="${props.reference}" />
            </RecordField>`,
  },
  referenceArray: {
    component: (props: any) => (
      <RecordField source={props.source}>
        <ReferenceArrayField
          source={props.source}
          reference={props.reference}
        />
      </RecordField>
    ),
    representation: (props: any) =>
      `<RecordField source="${props.source}">
                <ReferenceArrayField source="${props.source}" reference="${props.reference}" />
            </RecordField>`,
  },
  date: {
    component: (props: any) => (
      <RecordField source={props.source}>
        <DateField source={props.source} />
      </RecordField>
    ),
    representation: (props: any) =>
      `<RecordField source="${props.source}">
                <DateField source="${props.source}" />
            </RecordField>`,
  },
  number: {
    component: (props: any) => (
      <RecordField source={props.source}>
        <NumberField source={props.source} />
      </RecordField>
    ),
    representation: (props: any) =>
      `<RecordField source="${props.source}">
                <NumberField source="${props.source}" />
            </RecordField>`,
  },
  email: {
    component: (props: any) => (
      <RecordField source={props.source}>
        <EmailField source={props.source} />
      </RecordField>
    ),
    representation: (props: any) =>
      `<RecordField source="${props.source}">
                <EmailField source="${props.source}" />
            </RecordField>`,
  },
  url: {
    component: (props: any) => (
      <RecordField source={props.source}>
        <UrlField source={props.source} />
      </RecordField>
    ),
    representation: (props: any) =>
      `<RecordField source="${props.source}">
                <UrlField source="${props.source}" />
            </RecordField>`,
  },
  string: {
    component: (props: any) => <RecordField source={props.source} />,
    representation: (props: any) => `<RecordField source="${props.source}" />`,
  },
};

export { showFieldTypes };
