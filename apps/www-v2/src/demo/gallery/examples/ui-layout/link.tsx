import { Link } from "shadmin/components/admin";

export default function Example() {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <Link to="/orders">View all orders</Link>
      <Link to="/orders/1/show">Show order #1</Link>
      <Link to="/orders/1/edit">Edit order #1</Link>
    </div>
  );
}
