import { List } from "shadmin/components/admin";
import { SchemaDrivenView } from "shadmin/components/extras/schema-driven-view";
import { PRODUCT_SCHEMA } from "./product-schema";

/**
 * Alternate product list rendered from {@link PRODUCT_SCHEMA} via
 * {@link SchemaDrivenView}. Exposed at `/products/schema-view` to demo how a
 * flat JSON Schema can drive a DataTable without per-column wiring.
 */
export const ProductSchemaList = () => (
  <List resource="products">
    <SchemaDrivenView schema={PRODUCT_SCHEMA} mode="list" />
  </List>
);
