import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "shadmin/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "shadmin/components/ui/dialog";
import { searchIndex } from "@/docs/search-index";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Substring scoring (not cmdk's loose fuzzy subsequence): a title match ranks
// far above a section/description match, so "datatable" surfaces DataTable.
function score(value: string, search: string, keywords?: string[]): number {
  const s = norm(search);
  if (!s) return 1;
  const title = norm(value);
  if (title.includes(s)) return title.startsWith(s) ? 1 : 0.7;
  if (keywords?.some((k) => norm(k).includes(s))) return 0.3;
  return 0;
}

export function DocSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // ⌘K / Ctrl-K toggles the palette.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const go = (slug: string) => {
    setOpen(false);
    navigate(`/docs/${slug}`);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border bg-muted/40 px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted sm:w-56"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Search docs…</span>
        <kbd className="ml-auto hidden rounded border bg-background px-1.5 font-mono text-[10px] sm:inline">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0" showCloseButton={false}>
          <DialogTitle className="sr-only">Search documentation</DialogTitle>
          <Command filter={score}>
            <CommandInput placeholder="Search documentation…" />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {/* Flat list (no groups) so cmdk sorts ALL results by score
                  globally — a strong title match always ranks first. */}
              {searchIndex.map((e) => (
                <CommandItem
                  // title first (so substring scoring ranks it) + slug for a
                  // unique value; section/description as secondary matches.
                  key={e.slug}
                  value={`${e.title} ${e.slug}`}
                  keywords={[e.section, e.description]}
                  onSelect={() => go(e.slug)}
                >
                  <span className="font-medium text-foreground">{e.title}</span>
                  <span className="ml-2 truncate text-xs text-muted-foreground">
                    {e.section}
                  </span>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
