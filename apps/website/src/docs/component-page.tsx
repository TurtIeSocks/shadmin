import { Navigate, useParams } from "react-router-dom";

/**
 * Legacy redirect: component prose + install now live at the flat slug
 * (/docs/:name) via MdxGuide. Keep this route so old /docs/components/:name
 * links (and the catalog, pre-repoint) still resolve.
 */
export function ComponentPage() {
  const { name } = useParams<{ name: string }>();
  return <Navigate to={`/docs/${name ?? ""}`} replace />;
}
