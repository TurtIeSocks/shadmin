import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import type { ServerResponse } from "node:http";

// SSE test plugin — serves /sse (EventSource endpoint) and /sse-publish (POST)
// directly from the Vite dev server so Playwright browser tests can reach it
// without running into Private Network Access (PNA) restrictions.
function sseTestPlugin(): Plugin {
  const subscribers = new Set<ServerResponse>();

  return {
    name: "sse-test",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? "";
        if (!url.startsWith("/sse")) return next();

        if (url.startsWith("/sse-publish") && req.method === "POST") {
          let body = "";
          req.on("data", (c: Buffer) => (body += String(c)));
          req.on("end", () => {
            try {
              const { topic, event } = JSON.parse(body) as {
                topic: string;
                event: { type: string; payload: unknown; meta?: unknown };
              };
              const frame = `event: ${topic}\ndata: ${JSON.stringify(event)}\n\n`;
              for (const sub of subscribers) sub.write(frame);
              res.statusCode = 204;
              res.end();
            } catch {
              res.statusCode = 400;
              res.end();
            }
          });
          return;
        }

        // GET /sse — open SSE stream
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        });
        subscribers.add(res);
        req.on("close", () => subscribers.delete(res));
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), sseTestPlugin()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  optimizeDeps: {
    // Pre-bundle deps that Vite would otherwise discover mid-run. Discovery
    // triggers an HMR reload which surfaces as "Failed to fetch dynamically
    // imported module" or "more than one copy of React" inside the persistent
    // vitest browser worker.
    include: [
      "@dnd-kit/core",
      "react-dom/client",
      "data-generator-retail",
      "@tiptap/core",
      "@tiptap/react",
      "@tiptap/suggestion",
      "@tiptap/extension-drag-handle-react",
      "lucide-react",
    ],
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
      "src/components/block-editor/**/*.spec.{ts,tsx}",
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
