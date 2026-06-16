import { ResourceProps } from "ra-core";
import { CategoryList } from "./category-list";
import { CategoryEdit } from "./category-edit";
import { CategoryCreate } from "./category-create";
import { Bookmark } from "lucide-react";

export const categories: ResourceProps = {
  name: "categories",
  list: CategoryList,
  edit: CategoryEdit,
  create: CategoryCreate,
  recordRepresentation: "name",
  icon: Bookmark,
};
