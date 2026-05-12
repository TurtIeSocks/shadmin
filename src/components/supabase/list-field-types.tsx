/* eslint-disable @typescript-eslint/no-explicit-any */
import type { InferredTypeMap } from "ra-core";
import { DataTable } from "@/components/admin/data-table";
import { DateField } from "@/components/admin/date-field";
import { NumberField } from "@/components/admin/number-field";
import { EmailField } from "@/components/admin/email-field";
import { UrlField } from "@/components/admin/url-field";
import { ReferenceField } from "@/components/admin/reference-field";
import { ReferenceArrayField } from "@/components/admin/reference-array-field";

/**
 * Column-component map for the Supabase List guesser.
 */
export const listFieldTypes: InferredTypeMap = {
  table: {
    component: (props: any) => <DataTable {...props} />,
    representation: (
      _props: any,
      children: { getRepresentation: () => string }[],
    ) =>
      `        <DataTable>
${children
  .map((child) => `            ${child.getRepresentation()}`)
  .join("\n")}
        </DataTable>`,
  },
  reference: {
    component: (props: any) => (
      <DataTable.Col source={props.source}>
        <ReferenceField source={props.source} reference={props.reference} />
      </DataTable.Col>
    ),
    representation: (props: any) =>
      `<DataTable.Col source="${props.source}">
                <ReferenceField source="${props.source}" reference="${props.reference}" />
            </DataTable.Col>`,
  },
  referenceArray: {
    component: (props: any) => (
      <DataTable.Col source={props.source}>
        <ReferenceArrayField source={props.source} reference={props.reference} />
      </DataTable.Col>
    ),
    representation: (props: any) =>
      `<DataTable.Col source="${props.source}">
                <ReferenceArrayField source="${props.source}" reference="${props.reference}" />
            </DataTable.Col>`,
  },
  date: {
    component: (props: any) => (
      <DataTable.Col source={props.source}>
        <DateField source={props.source} />
      </DataTable.Col>
    ),
    representation: (props: any) =>
      `<DataTable.Col source="${props.source}">
                <DateField source="${props.source}" />
            </DataTable.Col>`,
  },
  number: {
    component: (props: any) => (
      <DataTable.Col source={props.source}>
        <NumberField source={props.source} />
      </DataTable.Col>
    ),
    representation: (props: any) =>
      `<DataTable.Col source="${props.source}">
                <NumberField source="${props.source}" />
            </DataTable.Col>`,
  },
  email: {
    component: (props: any) => (
      <DataTable.Col source={props.source}>
        <EmailField source={props.source} />
      </DataTable.Col>
    ),
    representation: (props: any) =>
      `<DataTable.Col source="${props.source}">
                <EmailField source="${props.source}" />
            </DataTable.Col>`,
  },
  url: {
    component: (props: any) => (
      <DataTable.Col source={props.source}>
        <UrlField source={props.source} />
      </DataTable.Col>
    ),
    representation: (props: any) =>
      `<DataTable.Col source="${props.source}">
                <UrlField source="${props.source}" />
            </DataTable.Col>`,
  },
  string: {
    component: DataTable.Col,
    representation: (props: any) =>
      `<DataTable.Col source="${props.source}" />`,
  },
};
