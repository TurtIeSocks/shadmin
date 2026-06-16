import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const shadminSrc = path.resolve(__dirname, "../../packages/shadmin/src");

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      // package-name imports used by demo source
      { find: /^shadmin\/(.+)$/, replacement: `${shadminSrc}/$1` },
      // the library's own internal `@/` imports (shadcn registry form)
      { find: "@", replacement: shadminSrc },
    ],
  },
  base: "./",
});
