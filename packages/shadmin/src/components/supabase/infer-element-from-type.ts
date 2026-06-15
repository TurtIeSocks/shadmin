import { required, type InferredTypeMap } from "ra-core";
import { pluralize } from "inflection";
import type { OpenAPIV2 } from "openapi-types";
import { InferredElement } from "./inferred-element";

const hasType = (type: string, types: InferredTypeMap) =>
  typeof types[type] !== "undefined";

interface InferElementFromTypeArgs {
  name: string;
  types: InferredTypeMap;
  description?: string;
  format?: string;
  type?: string;
  requiredFields?: string[];
  props?: Record<string, unknown>;
  schema: OpenAPIV2.Document;
}

/**
 * Inspects a single OpenAPI property and returns an `InferredElement`
 * pointing at the most specific field/input from `types`.
 *
 * Rules applied in order:
 *  1. `name === 'id'` → `types.id`.
 *  2. Description starting with `"Note:\nThis is a Foreign Key to "`
 *     → `types.reference` with an `<AutocompleteInput>` child whose
 *     `optionText` is inferred from the referenced resource's
 *     properties (`name` > `title` > `label` > `reference`).
 *  3. `name` ending in `_ids` → `types.referenceArray` with
 *     `<AutocompleteArrayInput>` child, reference inferred by
 *     pluralizing `name` with the `_ids` suffix stripped.
 *  4. `type === 'array'` (without `_ids` suffix) → fall back to string.
 *     Matches upstream `ra-supabase` behavior; deeper array
 *     introspection is intentionally out of scope.
 *  5. `type === 'string'` + `name === 'email'` → email.
 *  6. `type === 'string'` + `name in {url, website}` → url.
 *  7. `type === 'string'` + timestamp `format` → date.
 *  8. `type === 'integer'` → number.
 *  9. Any other `type` that maps in `types` → that type.
 * 10. Fallback → `types.string`.
 *
 * The `<AutocompleteInput>` PostgREST `filterToQuery` is set by the
 * `editFieldTypes` map (see edit-field-types.tsx) — this function
 * only supplies `optionText` and the structural children.
 */
const inferElementFromType = ({
  name,
  description,
  format,
  type,
  requiredFields,
  types,
  props,
  schema,
}: InferElementFromTypeArgs): InferredElement => {
  if (name === "id" && hasType("id", types)) {
    return new InferredElement(types.id, { source: "id" });
  }
  const validate = requiredFields?.includes(name) ? [required()] : undefined;

  if (
    description?.startsWith("Note:\nThis is a Foreign Key to") &&
    hasType("reference", types)
  ) {
    const reference = description.split("`")[1].split(".")[0];
    const referenceResourceDefinition = schema.definitions?.[reference];
    if (!referenceResourceDefinition) {
      throw new Error(
        `The referenced resource ${reference} is not defined in the API schema`,
      );
    }
    const recordRepresentationField = inferRecordRepresentationField(
      referenceResourceDefinition as OpenAPIV2.SchemaObject,
    );

    return new InferredElement(
      types.reference,
      { source: name, reference, ...props },
      hasType("autocompleteInput", types) && recordRepresentationField
        ? [
            new InferredElement(types.autocompleteInput, {
              optionText: recordRepresentationField,
            }),
          ]
        : undefined,
      hasType("autocompleteInput", types) && !recordRepresentationField
        ? `Could not infer the field to use to filter referenced ${reference} records. Please provide the \`filterToQuery\` prop to the <AutocompleteInput> component.`
        : undefined,
    );
  }

  if (name.endsWith("_ids") && hasType("referenceArray", types)) {
    const reference = pluralize(name.substring(0, name.length - 4));
    const referenceResourceDefinition = schema.definitions?.[reference];
    if (!referenceResourceDefinition) {
      throw new Error(
        `The referenced resource ${reference} is not defined in the API schema`,
      );
    }
    const recordRepresentationField = inferRecordRepresentationField(
      referenceResourceDefinition as OpenAPIV2.SchemaObject,
    );

    return new InferredElement(
      types.referenceArray,
      { source: name, reference, ...props },
      hasType("autocompleteArrayInput", types) && recordRepresentationField
        ? [
            new InferredElement(types.autocompleteArrayInput, {
              optionText: recordRepresentationField,
            }),
          ]
        : undefined,
      hasType("autocompleteArrayInput", types) && !recordRepresentationField
        ? `Could not infer the field to use to filter referenced ${reference} records. Please provide the \`filterToQuery\` prop to the <AutocompleteArrayInput> component.`
        : undefined,
    );
  }

  if (type === "array") {
    return new InferredElement(types.string, { source: name, validate });
  }

  if (type === "string") {
    if (name === "email" && hasType("email", types)) {
      return new InferredElement(types.email, {
        source: name,
        validate,
        ...props,
      });
    }
    if (["url", "website"].includes(name) && hasType("url", types)) {
      return new InferredElement(types.url, {
        source: name,
        validate,
        ...props,
      });
    }
    if (
      format &&
      ["timestamp with time zone", "timestamp without time zone"].includes(
        format,
      ) &&
      hasType("date", types)
    ) {
      return new InferredElement(types.date, {
        source: name,
        validate,
        ...props,
      });
    }
  }

  if (type === "integer" && hasType("number", types)) {
    return new InferredElement(types.number, {
      source: name,
      validate,
      ...props,
    });
  }

  if (type && hasType(type, types)) {
    return new InferredElement(types[type], {
      source: name,
      validate,
      ...props,
    });
  }

  return new InferredElement(types.string, {
    source: name,
    validate,
    ...props,
  });
};

const inferRecordRepresentationField = (
  def: OpenAPIV2.SchemaObject,
): string | undefined => {
  if (def.properties?.name != null) return "name";
  if (def.properties?.title != null) return "title";
  if (def.properties?.label != null) return "label";
  if (def.properties?.reference != null) return "reference";
  return undefined;
};

export { inferElementFromType };
