import { ResourceProps } from "ra-core";
import { CustomerList } from "./customer-list";
import { CustomerEdit } from "./customer-edit";
import { CustomerCreate } from "./customer-create";
import { Users } from "lucide-react";

export const customers: ResourceProps = {
  name: "customers",
  list: CustomerList,
  edit: CustomerEdit,
  create: CustomerCreate,
  recordRepresentation: (record) => `${record.first_name} ${record.last_name}`,
  icon: Users,
};
