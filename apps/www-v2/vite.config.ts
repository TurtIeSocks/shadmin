import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
    tailwindcss(),
  ],
  root: __dirname,
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // vite-react-ssg imports react-router-dom/server.js which doesn't exist in RR7.
      // In RR7 these APIs moved to react-router (core). Alias to our shim.
      "react-router-dom/server.js": path.resolve(__dirname, "./src/react-router-server-shim.ts"),
    },
  },
});
