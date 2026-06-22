import type { ComponentType, ReactNode } from "react";
import type { RaRecord, ResourceDefinition } from "shadmin-core";
import {
  FolderTree,
  Package,
  ShoppingCart,
  Star,
  Tag,
  Users,
} from "lucide-react";

import { CategoriesCreate } from "./categories/categories-create";
import { CategoriesEdit } from "./categories/categories-edit";
import { CategoriesList } from "./categories/categories-list";
import { CategoriesShow } from "./categories/categories-show";
import { CustomersCreate } from "./customers/customers-create";
import { CustomersEdit } from "./customers/customers-edit";
import { CustomersList } from "./customers/customers-list";
import { CustomersShow } from "./customers/customers-show";
import { OrdersEdit } from "./orders/orders-edit";
import { OrdersList } from "./orders/orders-list";
import { OrdersShow } from "./orders/orders-show";
import { ProductsCreate } from "./products/products-create";
import { ProductsEdit } from "./products/products-edit";
import { ProductsList } from "./products/products-list";
import { ProductsShow } from "./products/products-show";
import { ReviewsEdit } from "./reviews/reviews-edit";
import { ReviewsList } from "./reviews/reviews-list";
import { ReviewsShow } from "./reviews/reviews-show";
import { TagsCreate } from "./tags/tags-create";
import { TagsEdit } from "./tags/tags-edit";
import { TagsList } from "./tags/tags-list";
import { TagsShow } from "./tags/tags-show";

/**
 * A demo resource entry: the four CRUD page components (any may be omitted while
 * Task 7 fills the real pages), plus sidebar presentation (`icon` + `label`).
 */
export interface DemoResource {
  list?: ComponentType;
  edit?: ComponentType;
  show?: ComponentType;
  create?: ComponentType;
  icon: ReactNode;
  label: string;
  /** How a record of this resource renders when referenced (e.g. in a
   *  ReferenceField). Without it, references show `#<id>`. */
  recordRepresentation?: string | ((record: RaRecord) => string);
}

/**
 * Registry of the six demo resources, keyed by resource name (the same name the
 * fakerest data provider serves and that drives `/demo/app/<name>` routing).
 *
 * `app-routes.tsx` looks pages up here; `demo-sidebar.tsx` renders the App zone
 * from the same map so the nav and the routes never drift.
 */
export const demoResources: Record<string, DemoResource> = {
  customers: {
    label: "Customers",
    icon: <Users />,
    recordRepresentation: (r) =>
      [r.first_name, r.last_name].filter(Boolean).join(" ") || `#${r.id}`,
    list: CustomersList,
    edit: CustomersEdit,
    show: CustomersShow,
    create: CustomersCreate,
  },
  categories: {
    label: "Categories",
    icon: <FolderTree />,
    recordRepresentation: "name",
    list: CategoriesList,
    edit: CategoriesEdit,
    show: CategoriesShow,
    create: CategoriesCreate,
  },
  products: {
    label: "Products",
    icon: <Package />,
    recordRepresentation: "reference",
    list: ProductsList,
    edit: ProductsEdit,
    show: ProductsShow,
    create: ProductsCreate,
  },
  orders: {
    label: "Orders",
    icon: <ShoppingCart />,
    recordRepresentation: (r) => r.reference ?? `#${r.id}`,
    list: OrdersList,
    edit: OrdersEdit,
    show: OrdersShow,
  },
  reviews: {
    label: "Reviews",
    icon: <Star />,
    recordRepresentation: (r) => `#${r.id}`,
    list: ReviewsList,
    edit: ReviewsEdit,
    show: ReviewsShow,
  },
  tags: {
    label: "Tags",
    icon: <Tag />,
    recordRepresentation: "name",
    list: TagsList,
    edit: TagsEdit,
    show: TagsShow,
    create: TagsCreate,
  },
};

export const demoResourceNames = Object.keys(demoResources);

/**
 * ra-core ResourceDefinitions derived from the registry — passed to a
 * `<ResourceDefinitionContextProvider>` in demo-layout so References resolve to
 * a readable representation (a name) instead of `#<id>`.
 */
export const resourceDefinitions: Record<string, ResourceDefinition> =
  Object.fromEntries(
    Object.entries(demoResources).map(([name, r]) => [
      name,
      {
        name,
        hasList: !!r.list,
        hasCreate: !!r.create,
        hasEdit: !!r.edit,
        hasShow: !!r.show,
        icon: r.icon,
        recordRepresentation: r.recordRepresentation,
      } satisfies ResourceDefinition,
    ]),
  );
