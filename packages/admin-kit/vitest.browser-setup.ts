// Runs once in the browser test environment before any spec.
//
// Monaco's web-worker bootstrap fails in Vitest's browser provider because
// its `FileAccess` helper depends on Vite plugin internals that aren't
// loaded in the test sandbox. The failure surfaces as an
// `unhandledrejection` ("Cannot read properties of undefined (reading
// 'toUrl')") which makes Vitest exit non-zero even when every test passes.
//
// Provide a stub `MonacoEnvironment.getWorker` so Monaco gets a working
// Worker object without going through its broken file-access path. The
// stub worker is a no-op (empty script) — synchronous JSON parsing still
// works on the main thread, which is what our specs assert against.
declare global {
  interface Window {
    MonacoEnvironment?: {
      getWorker?: (workerId: string, label: string) => Worker;
      getWorkerUrl?: (workerId: string, label: string) => string;
    };
  }
}

const NOOP_WORKER_SOURCE = `
  self.onmessage = function () {};
`;

const noopWorkerUrl = URL.createObjectURL(
  new Blob([NOOP_WORKER_SOURCE], { type: "application/javascript" }),
);

window.MonacoEnvironment = {
  getWorker: () => new Worker(noopWorkerUrl),
  getWorkerUrl: () => noopWorkerUrl,
};

// Belt-and-suspenders: if anything still leaks an unhandled rejection from
// Monaco's worker-loader internals, swallow only that specific noise.
window.addEventListener("unhandledrejection", (event) => {
  const message =
    event.reason instanceof Error
      ? event.reason.message
      : typeof event.reason === "string"
        ? event.reason
        : "";
  if (
    message.includes("toUrl") ||
    message.includes("loadForeignModule") ||
    message.includes("FileAccess")
  ) {
    event.preventDefault();
  }
});
