import { ResourceProps } from "ra-core";
import { DollarSign } from "lucide-react";
import { OrderList } from "./order-list";
import { OrderEdit } from "./order-edit";
import { OrderShow } from "./order-show";

export const orders: ResourceProps = {
  name: "orders",
  list: OrderList,
  edit: OrderEdit,
  show: OrderShow,
  recordRepresentation: "reference",
  icon: DollarSign,
};
