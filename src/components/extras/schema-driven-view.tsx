"use client";

import type { ReactNode } from "react";
import {
  BooleanField,
  BooleanInput,
  DataTable,
  DateField,
  DateInput,
  EmailField,
  NumberField,
  NumberInput,
  RecordField,
  SelectField,
  SelectInput,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
} from "@/components/admin";

export interface JsonSchemaProperty {
  type: "string" | "number" | "integer" | "boolean";
  format?: "email" | "date" | "date-time" | "uri";
  enum?: readonly string[];
  title?: string;
}

export interface JsonSchema {
  type: "object";
  properties: Record<string, JsonSchemaProperty>;
}

export interface SchemaDrivenViewProps {
  schema: JsonSchema;
  mode: "list" | "edit" | "show";
  /** Map of property key → custom ReactNode used instead of the default mapping. */
  overrides?: Record<string, ReactNode>;
}

/**
 * Generates a List/Edit/Show view from a flat JSON Schema. Each top-level
 * property maps to an appropriate field or input component based on `type`
 * and `format`. Override individual property renderings via `overrides`.
 *
 * Flat schemas only in v1 — nested objects and array-of-object are deferred.
 *
 * @example
 * <SchemaDrivenView schema={SCHEMA} mode="show" />
 * <SchemaDrivenView schema={SCHEMA} mode="list" />
 * <SchemaDrivenView schema={SCHEMA} mode="edit" overrides={{ title: <TextInput source="title" multiline /> }} />
 */
export const SchemaDrivenView = ({
  schema,
  mode,
  overrides,
}: SchemaDrivenViewProps) => {
  const entries = Object.entries(schema.properties);

  if (mode === "list") {
    return (
      <DataTable>
        {entries.map(([key, prop]) => {
          if (overrides?.[key]) {
            return (
              <DataTable.Col key={key} source={key} label={prop.title}>
                {overrides[key]}
              </DataTable.Col>
            );
          }
          return (
            <DataTable.Col key={key} source={key} label={prop.title}>
              {renderField(key, prop)}
            </DataTable.Col>
          );
        })}
      </DataTable>
    );
  }

  if (mode === "edit") {
    return (
      <SimpleForm>
        {entries.map(([key, prop]) => {
          if (overrides?.[key]) {
            return <span key={key}>{overrides[key]}</span>;
          }
          return renderInput(key, prop);
        })}
      </SimpleForm>
    );
  }

  // show
  return (
    <SimpleShowLayout>
      {entries.map(([key, prop]) => {
        if (overrides?.[key]) {
          return (
            <RecordField key={key} source={key} label={prop.title}>
              {overrides[key]}
            </RecordField>
          );
        }
        return (
          <RecordField key={key} source={key} label={prop.title}>
            {renderField(key, prop)}
          </RecordField>
        );
      })}
    </SimpleShowLayout>
  );
};

function renderField(key: string, prop: JsonSchemaProperty): ReactNode {
  if (prop.enum) {
    return (
      <SelectField
        source={key}
        choices={prop.enum.map((v) => ({ id: v, name: v }))}
      />
    );
  }
  if (prop.format === "email") return <EmailField source={key} />;
  if (prop.format === "date" || prop.format === "date-time") {
    return <DateField source={key} />;
  }
  if (prop.type === "boolean") return <BooleanField source={key} />;
  if (prop.type === "number" || prop.type === "integer") {
    return <NumberField source={key} />;
  }
  return <TextField source={key} />;
}

function renderInput(key: string, prop: JsonSchemaProperty): ReactNode {
  if (prop.enum) {
    return (
      <SelectInput
        key={key}
        source={key}
        choices={prop.enum.map((v) => ({ id: v, name: v }))}
      />
    );
  }
  if (prop.format === "date" || prop.format === "date-time") {
    return <DateInput key={key} source={key} />;
  }
  if (prop.type === "boolean") {
    return <BooleanInput key={key} source={key} />;
  }
  if (prop.type === "number" || prop.type === "integer") {
    return <NumberInput key={key} source={key} />;
  }
  return <TextInput key={key} source={key} />;
}
