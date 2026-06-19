export interface InstallCommands {
  npm: string;
  pnpm: string;
  yarn: string;
  bun: string;
}

export interface ManifestItem {
  name: string;
  title: string;
  description: string | null;
  type: string;
  category: string;
  docs: string | null;
  install: InstallCommands;
}

export interface NavItem {
  name: string;
  title: string;
}

export interface NavGroup {
  category: string;
  label: string;
  items: NavItem[];
}

export interface RegistryManifest {
  generatedAt: string | null;
  items: ManifestItem[];
  nav: NavGroup[];
}
