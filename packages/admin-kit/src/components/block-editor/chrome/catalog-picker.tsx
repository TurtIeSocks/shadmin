import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { BlockRegistry } from "../block-registry";

export interface CatalogPickerProps {
  registry: BlockRegistry;
  onSelect: (blockName: string) => void;
  onClose: () => void;
}

const GROUP_LABELS: Record<string, string> = {
  content: "Content",
  media: "Media",
  layout: "Layout",
  data: "Data",
};

/**
 * Presentational cmdk picker — groups blocks by their `group`, filters by the
 * search query (cmdk matches each item's `value`), and fires `onSelect` with the
 * chosen block's name. Insertion is performed by the caller, not here.
 */
export function CatalogPicker({ registry, onSelect, onClose }: CatalogPickerProps) {
  return (
    <Command
      className="w-72 rounded-md border shadow-md"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <CommandInput placeholder="Search blocks…" autoFocus />
      <CommandList>
        <CommandEmpty>No blocks found.</CommandEmpty>
        {registry.groups().map(({ group, blocks }) => (
          <CommandGroup key={group} heading={GROUP_LABELS[group] ?? group}>
            {blocks.map((block) => {
              const Icon = block.icon;
              return (
                <CommandItem
                  key={block.name}
                  value={`${block.label} ${block.keywords?.join(" ") ?? ""}`}
                  onSelect={() => onSelect(block.name)}
                >
                  <Icon className="mr-2 size-4" />
                  <span>{block.label}</span>
                  {block.description && (
                    <span className="ml-2 truncate text-xs text-muted-foreground">
                      {block.description}
                    </span>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  );
}
