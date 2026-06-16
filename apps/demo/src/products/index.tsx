import { ResourceProps } from "ra-core";
import { ProductList } from "./product-list";
import { ProductEdit } from "./product-edit";
import { ProductCreate } from "./product-create";
import { Images } from "lucide-react";

export const products: ResourceProps = {
  name: "products",
  list: ProductList,
  edit: ProductEdit,
  create: ProductCreate,
  recordRepresentation: "reference",
  icon: Images,
};
