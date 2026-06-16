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

// Make the semantic design tokens resolvable via `getComputedStyle(:root)` so
// ThemeStudio's `useThemeVars` can seed editable values during tests.
//
// We deliberately do NOT `import "./src/index.css"` here: that pulls in the
// full Tailwind layer (including Preflight), which when injected globally into
// the browser provider collapses the rendered size of small interactive
// controls (checkboxes, switches, color swatches) and makes unrelated specs
// fail their click assertions with "element is not visible". Injecting only
// the `:root` / `.dark` custom-property blocks (copied verbatim from
// `src/index.css`) gives the tokens without any layout side-effects.
const TOKEN_BLOCKS = `
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}
`;

const tokenStyle = document.createElement("style");
tokenStyle.setAttribute("data-theme-tokens", "test");
tokenStyle.textContent = TOKEN_BLOCKS;
document.head.appendChild(tokenStyle);
