import type { ComponentType, ReactNode } from "react";
import {
  FolderTree,
  Package,
  ShoppingCart,
  Star,
  Tag,
  Users,
} from "lucide-react";

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

// --- Stub pages -------------------------------------------------------------
// Task 7 swaps these for real <List>/<Edit>/<Show>/<Create> pages. They exist
// now so routing + the shell can be verified end-to-end.
const stub = (name: string, view: string): ComponentType => {
  const Stub = () => (
    <div className="p-6 text-sm text-muted-foreground">
      {name} {view} — coming in Task 7
    </div>
  );
  Stub.displayName = `${name}-${view}-stub`;
  return Stub;
};

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
    list: stub("categories", "list"),
    edit: stub("categories", "edit"),
    show: stub("categories", "show"),
    create: stub("categories", "create"),
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
    list: stub("reviews", "list"),
    edit: stub("reviews", "edit"),
    show: stub("reviews", "show"),
    create: stub("reviews", "create"),
  },
  tags: {
    label: "Tags",
    icon: <Tag />,
    list: stub("tags", "list"),
    edit: stub("tags", "edit"),
    show: stub("tags", "show"),
    create: stub("tags", "create"),
  },
};

export const demoResourceNames = Object.keys(demoResources);
