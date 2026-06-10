import type { JsonSchema } from "shadcn-admin-kit/components/extras/schema-driven-view";

/**
 * Flat JSON Schema describing a Product for the SchemaDrivenView demo.
 *
 * SchemaDrivenView only supports flat scalar properties (string/number/
 * integer/boolean) with optional `format` and `enum`. References, currency
 * formatting, and ratings are not first-class — `category_id` falls back to a
 * plain number column, and `price` renders as a number titled "Price (USD)".
 */
export const PRODUCT_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    id: { type: "integer", title: "ID" },
    reference: { type: "string", title: "Ref" },
    category_id: { type: "integer", title: "Category" },
    price: { type: "number", title: "Price (USD)" },
    stock: { type: "integer", title: "Stock" },
  },
};
