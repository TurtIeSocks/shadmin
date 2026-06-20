import { NavLink, Outlet } from "react-router";
import { navTree } from "./nav-content";
import type { DocNode } from "./types";

function NodeView({ node }: { node: DocNode }) {
  if (node.kind === "group") {
    return (
      <div className="mb-4">
        <p className="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
          {node.title}
        </p>
        <div>
          {node.children.map((c) => (
            <NodeView key={c.kind === "leaf" ? c.slug : c.dir} node={c} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <NavLink
      to={`/docs/${node.slug}`}
      className={({ isActive }) =>
        `block rounded px-2 py-1 text-sm ${isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`
      }
    >
      {node.title}
    </NavLink>
  );
}

export default function DocsLayout() {
  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8">
      <aside className="w-60 shrink-0">
        <nav>
          {navTree.map((n) => (
            <NodeView key={n.dir} node={n} />
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
