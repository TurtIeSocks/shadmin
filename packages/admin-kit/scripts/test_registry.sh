#!/bin/bash

# End-to-end registry install test.
#
# Run from the package root: cd packages/admin-kit && ./scripts/test_registry.sh
# (this is what `make test-registry` does).
#
# Builds the registry, serves it on http://localhost:8080, scaffolds a fresh
# standalone consumer Vite app in a temp folder, runs `shadcn add` against the
# local registry, and builds the scaffold. The scaffold intentionally carries
# NO monorepo aliases: it must compile from what `shadcn add` installs alone,
# exactly like a real consumer project would.

set -e

SERVER_PID=""
cleanup() {
  if [ -n "$SERVER_PID" ]; then
    kill "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

# The demo app's vite.config.ts and tsconfig.app.json alias
# `shadcn-admin-kit/*` and `@/*` to ../../packages/admin-kit/src — wrong for a
# standalone consumer, so the scaffold gets plain versions generated here.
write_standalone_configs() {
  local target_dir=$1

  cat > "$target_dir/vite.config.ts" <<'EOF'
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "./",
});
EOF

  cat > "$target_dir/tsconfig.app.json" <<'EOF'
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
EOF

  # The temp app lives inside the monorepo tree; this stub makes it its own
  # pnpm workspace root so installs stay standalone instead of resolving
  # against the repo workspace.
  cat > "$target_dir/pnpm-workspace.yaml" <<'EOF'
packages: []
EOF
}

# Consumer-side sources. They import from `@/...` — the alias `shadcn add`
# output satisfies — never from the `shadcn-admin-kit` package.
write_app_sources() {
  local target_dir=$1
  local app_variant=$2

  cat > "$target_dir/src/dataProvider.ts" <<'EOF'
import fakeRestDataProvider from "ra-data-fakerest";
import generateData from "data-generator-retail";

export const dataProvider = fakeRestDataProvider(generateData(), true, 500);
EOF

  case "$app_variant" in
    guessers)
      cat > "$target_dir/src/App.tsx" <<'EOF'
import { dataProvider } from "./dataProvider";
import { Admin } from "@/components/admin/admin";
import { ListGuesser } from "@/components/admin/list-guesser";
import { ShowGuesser } from "@/components/admin/show-guesser";
import { EditGuesser } from "@/components/admin/edit-guesser";
import { Resource } from "@/components/admin/resource";

function App() {
  return (
    <Admin dataProvider={dataProvider}>
      <Resource
        name="products"
        list={ListGuesser}
        show={ShowGuesser}
        edit={EditGuesser}
        recordRepresentation="reference"
      />
      <Resource
        name="categories"
        list={ListGuesser}
        show={ShowGuesser}
        edit={EditGuesser}
        recordRepresentation="name"
      />
    </Admin>
  );
}

export default App;
EOF
      ;;
    rich-text)
      cat > "$target_dir/src/App.tsx" <<'EOF'
import { CoreAdminContext, RecordContextProvider } from "ra-core";

import { SimpleForm, ThemeProvider } from "@/components/admin";
import { RichTextInput } from "@/components/rich-text-input";
import { i18nProvider } from "@/lib/i18n-provider";

const record = {
  id: 1,
  body: "<p>Smoke test content</p>",
};

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <CoreAdminContext i18nProvider={i18nProvider}>
        <RecordContextProvider value={record}>
          <main className="mx-auto max-w-3xl p-6">
            <SimpleForm defaultValues={record} toolbar={null}>
              <RichTextInput source="body" />
            </SimpleForm>
          </main>
        </RecordContextProvider>
      </CoreAdminContext>
    </ThemeProvider>
  );
}

export default App;
EOF
      ;;
    *)
      echo "Unknown app variant: $app_variant" >&2
      exit 1
      ;;
  esac
}

setup_temp_app() {
  local target_dir=$1
  local app_variant=${2:-guessers}

  rm -rf "$target_dir"
  mkdir "$target_dir"

  # shadcn config + scaffold manifest from the package root
  cp ./components.json "$target_dir"
  cp ./package-test.json "$target_dir/package.json"

  # generic scaffold files from the demo app (no monorepo content in these)
  cp ../../apps/demo/index.html ../../apps/demo/tsconfig.json ../../apps/demo/tsconfig.node.json "$target_dir"

  # monorepo-shaped configs get standalone replacements instead
  write_standalone_configs "$target_dir"

  # favicon referenced by index.html
  mkdir "$target_dir/public"
  cp ../../public/favicon.ico "$target_dir/public/favicon.ico"

  mkdir "$target_dir/src"
  # the library stylesheet is standalone (tailwind entry + theme variables)
  cp ./src/index.css ./src/vite-env.d.ts "$target_dir/src"
  cp ../../apps/demo/src/main.tsx "$target_dir/src"
  write_app_sources "$target_dir" "$app_variant"
}

echo "Building registry"
pnpm run registry:build

echo "Serving registry locally on port 8080"
python3 -m http.server -d ./dist 8080 &
SERVER_PID=$!

echo "Creating new Vite app in a temp folder for admin block"
setup_temp_app ./temp guessers

echo "Installing dependencies"
cd ./temp
pnpm install

echo "Adding registry components"
pnpm dlx shadcn@latest add -y http://localhost:8080/r/admin.json

echo "Building generated admin app"
pnpm run build

cd ..

echo "Creating new Vite app in a temp folder for rich-text-input block"
setup_temp_app ./temp-rich-text-input rich-text

echo "Installing dependencies"
cd ./temp-rich-text-input
pnpm install

echo "Configuring custom registry alias for namespaced dependencies"
node -e "const fs = require('fs'); const path = './components.json'; const json = JSON.parse(fs.readFileSync(path, 'utf8')); json.registries = { ...(json.registries || {}), '@shadcn-admin-kit': 'http://localhost:8080/r/{name}.json' }; fs.writeFileSync(path, JSON.stringify(json, null, 2));"

echo "Adding admin and rich-text-input registry components"
pnpm dlx shadcn@latest add -y http://localhost:8080/r/admin.json http://localhost:8080/r/rich-text-input.json

echo "Building generated rich-text-input app"
pnpm run build

echo "Stopping registry server"
kill $SERVER_PID
SERVER_PID=""

echo "All done!"
