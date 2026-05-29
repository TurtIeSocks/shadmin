import type { BlockDefinition } from "./define-block";

export interface BlockGroup {
  group: string;
  blocks: BlockDefinition[];
}

export interface BlockRegistry {
  get(name: string): BlockDefinition | undefined;
  list(): BlockDefinition[];
  names(): string[];
  groups(): BlockGroup[];
}

export function createBlockRegistry(blocks: BlockDefinition[]): BlockRegistry {
  const byName = new Map<string, BlockDefinition>();
  for (const block of blocks) {
    if (byName.has(block.name)) {
      throw new Error(`block-editor: duplicate block name "${block.name}"`);
    }
    byName.set(block.name, block);
  }

  return {
    get: (name) => byName.get(name),
    list: () => [...byName.values()],
    names: () => [...byName.keys()],
    groups: () => {
      const order: string[] = [];
      const map = new Map<string, BlockDefinition[]>();
      for (const block of byName.values()) {
        if (!map.has(block.group)) {
          map.set(block.group, []);
          order.push(block.group);
        }
        map.get(block.group)!.push(block);
      }
      return order.map((group) => ({ group, blocks: map.get(group)! }));
    },
  };
}
