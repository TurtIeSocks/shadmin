import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const adminKitSrc = path.resolve(__dirname, "../../packages/admin-kit/src");

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      // package-name imports used by demo source
      { find: /^shadmin\/(.+)$/, replacement: `${adminKitSrc}/$1` },
      // the library's own internal `@/` imports (shadcn registry form)
      { find: "@", replacement: adminKitSrc },
    ],
  },
  base: "./",
});
