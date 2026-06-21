import type { ComponentType, ReactNode } from "react";
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
    list: CustomersList,
    edit: CustomersEdit,
    show: CustomersShow,
    create: CustomersCreate,
  },
  categories: {
    label: "Categories",
    icon: <FolderTree />,
    list: CategoriesList,
    edit: CategoriesEdit,
    show: CategoriesShow,
    create: CategoriesCreate,
  },
  products: {
    label: "Products",
    icon: <Package />,
    list: ProductsList,
    edit: ProductsEdit,
    show: ProductsShow,
    create: ProductsCreate,
  },
  orders: {
    label: "Orders",
    icon: <ShoppingCart />,
    list: OrdersList,
    edit: OrdersEdit,
    show: OrdersShow,
  },
  reviews: {
    label: "Reviews",
    icon: <Star />,
    list: ReviewsList,
    edit: ReviewsEdit,
    show: ReviewsShow,
  },
  tags: {
    label: "Tags",
    icon: <Tag />,
    list: TagsList,
    edit: TagsEdit,
    show: TagsShow,
    create: TagsCreate,
  },
};

export const demoResourceNames = Object.keys(demoResources);
