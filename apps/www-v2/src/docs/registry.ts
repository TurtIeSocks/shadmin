import registry from "../../../../packages/shadmin/registry.json" with { type: "json" };
import type { InstallCommands } from "./types";

interface RegistryItem { name: string; }
const names = new Set<string>(
  (registry as { items: RegistryItem[] }).items.map((i) => i.name),
);

function basename(slug: string): string {
  const i = slug.lastIndexOf("/");
  return i === -1 ? slug : slug.slice(i + 1);
}

export function installFor(slug: string): InstallCommands | null {
  const name = basename(slug);
  if (!names.has(name)) return null;
  const ref = `@shadmin/${name}`;
  return {
    npm: `npx shadcn@latest add ${ref}`,
    pnpm: `pnpm dlx shadcn@latest add ${ref}`,
    yarn: `yarn dlx shadcn@latest add ${ref}`,
    bun: `bunx shadcn@latest add ${ref}`,
  };
}
