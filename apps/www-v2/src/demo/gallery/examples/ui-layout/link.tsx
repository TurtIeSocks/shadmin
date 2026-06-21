import { Link } from "shadmin/components/admin";

export default function Example() {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <Link to="/posts">View all posts</Link>
      <Link to="/posts/1/show">Show post #1</Link>
      <Link to="/posts/1/edit">Edit post #1</Link>
    </div>
  );
}
