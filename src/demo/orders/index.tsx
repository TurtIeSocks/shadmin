import { ResourceProps } from "ra-core";
import { DollarSign } from "lucide-react";
import { OrderList } from "./OrderList";
import { OrderEdit } from "./OrderEdit";
import { OrderShow } from "./OrderShow";

export { OrderShow };

export const orders: ResourceProps = {
  name: "orders",
  list: OrderList,
  edit: OrderEdit,
  show: OrderShow,
  recordRepresentation: "reference",
  icon: DollarSign,
};
