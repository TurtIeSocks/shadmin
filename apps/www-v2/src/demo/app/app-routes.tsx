import { ResourceContextProvider } from "shadmin-core";
import { Navigate, Route, Routes, useParams } from "react-router";
import { demoResources } from "./resources";
import { Dashboard } from "./dashboard/dashboard";

/**
 * Resolves a single CRUD page for the resource named in the URL.
 *
 * ra-core's `<List>/<Create>/<Edit>/<Show>` are rendered standalone here (no
 * `<Resource>`/`<Admin>`): each needs a `<ResourceContextProvider>` so the page
 * knows which resource it serves. Edit/Show additionally need the record id —
 * ra-core's `useEditController`/`useShowController` read `:id` from
 * `useParams()`, but we pass it explicitly so the contract is obvious and robust
 * to route-param shape changes.
 */
function ResourcePage({ view }: { view: "list" | "create" | "edit" | "show" }) {
  const { resource, id } = useParams<{ resource: string; id: string }>();

  if (!resource || !(resource in demoResources)) {
    return <Navigate to="/demo/app" replace />;
  }

  const entry = demoResources[resource];
  const Component = entry[view];

  if (!Component) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        No {view} page for “{resource}”.
      </div>
    );
  }

  // List/Create take no record id; Edit/Show read it from the route param.
  const element =
    view === "edit" || view === "show" ? <Component key={id} /> : <Component />;

  return (
    <ResourceContextProvider value={resource}>
      {element}
    </ResourceContextProvider>
  );
}

/**
 * Generic resource routing mounted at `/demo/app/*`.
 *
 *   index            → Dashboard placeholder
 *   :resource        → list
 *   :resource/create → create
 *   :resource/:id    → edit
 *   :resource/:id/show → show
 *
 * A nested React Router `<Routes>` (not ra-core's resource router) keeps the
 * single-`<CoreAdminContext>` demo wiring intact while resolving pages from the
 * `demoResources` registry.
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path=":resource" element={<ResourcePage view="list" />} />
      <Route path=":resource/create" element={<ResourcePage view="create" />} />
      <Route path=":resource/:id" element={<ResourcePage view="edit" />} />
      <Route path=":resource/:id/show" element={<ResourcePage view="show" />} />
      <Route path="*" element={<Navigate to="/demo/app" replace />} />
    </Routes>
  );
}
