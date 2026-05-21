import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  optimizeDeps: {
    include: ["@dnd-kit/core"],
  },
  test: {
    testTimeout: 2500,
    include: [
      "src/components/admin/**/*.spec.{ts,tsx}",
      "src/components/csv-import/**/*.spec.{ts,tsx}",
      "src/components/extras/**/*.spec.{ts,tsx}",
      "src/components/leaflet/**/*.spec.{ts,tsx}",
      "src/components/mdx-editor/**/*.spec.{ts,tsx}",
      "src/components/monaco/**/*.spec.{ts,tsx}",
      "src/components/realtime/**/*.spec.{ts,tsx}",
      "src/components/rich-text-input/**/*.spec.{ts,tsx}",
      "src/components/supabase/**/*.spec.{ts,tsx}",
      "src/{hooks,lib,stories}/**/*.spec.{ts,tsx}",
    ],
    browser: {
      enabled: true,
      provider: "playwright",
      instances: [
        {
          browser: "chromium",
          viewport: {
            width: 1920,
            height: 1080,
          },
        },
      ],
    },
    globalSetup: "./vitest.global-setup.ts",
    setupFiles: ["./vitest.browser-setup.ts"],
  },
});
