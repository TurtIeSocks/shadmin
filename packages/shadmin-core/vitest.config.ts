import { defineConfig } from "vitest/config";
import type { Plugin } from "vite";
import type { ServerResponse } from "node:http";

// SSE test plugin — serves /sse (EventSource endpoint) and /sse-publish (POST)
// from the Vite dev server so the browser-provider transport tests can reach it
// without Private Network Access restrictions. Copied from the shadmin package
// (the sse-transport spec depends on it).
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

// Core hosts the headless realtime LOGIC tests (transports, topics, the
// data-provider wrapper). The hook tests render through shadmin's UI test
// wrapper and therefore live in the shadmin package, not here.
export default defineConfig({
  plugins: [sseTestPlugin()],
  resolve: { alias: { "@": "/src" } },
  optimizeDeps: {
    include: ["ra-data-fakerest", "mock-socket"],
  },
  test: {
    testTimeout: 2500,
    include: ["src/realtime/**/*.spec.ts"],
    browser: {
      enabled: true,
      provider: "playwright",
      instances: [
        { browser: "chromium", viewport: { width: 1280, height: 720 } },
      ],
    },
    globalSetup: "./vitest.global-setup.ts",
  },
});
