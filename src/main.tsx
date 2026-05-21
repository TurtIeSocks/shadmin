import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import SelectedApp from "./demo/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <SelectedApp />
    </Suspense>
  </StrictMode>
);
