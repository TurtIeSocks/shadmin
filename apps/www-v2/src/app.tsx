import { Outlet } from "react-router-dom";
import { SiteNav } from "@/components/site-nav";

export function App() {
  return (
    <div className="min-h-dvh flex flex-col">
      <SiteNav />
      <Outlet />
    </div>
  );
}
