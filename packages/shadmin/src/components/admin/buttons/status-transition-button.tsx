import { useRecordContext, useResourceContext, useUpdate } from "shadmin-core";
import type { RaRecord } from "shadmin-core";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface StatusTransitionButtonProps {
  /** Record field holding the current state. Defaults to `"status"`. */
  source?: string;
  /** Map of state → allowed next states. */
  transitions: Record<string, readonly string[]>;
  /** Optional `${from}->${to}` predicates to allow/block specific moves. */
  guards?: Record<string, (record: RaRecord) => boolean>;
  /** Override resource (defaults to the surrounding `<ResourceContext>`). */
  resource?: string;
  /** Show a native `confirm()` before firing the update. */
  confirm?: boolean;
  /** Side-effect hook fired after the update is dispatched. */
  onTransition?: (from: string, to: string, record: RaRecord) => void;
}

/**
 * Reads the record's status from `source`, looks up allowed transitions in
 * `transitions`, optionally filters via `guards`, and renders a dropdown that
 * fires `useUpdate` on selection.
 *
 * @example
 * <StatusTransitionButton
 *   source="status"
 *   transitions={{ draft: ["review"], review: ["published"] }}
 * />
 */
function StatusTransitionButton(props: StatusTransitionButtonProps) {
  const {
    source = "status",
    transitions,
    guards,
    resource: resourceProp,
    onTransition,
    confirm,
  } = props;
  const record = useRecordContext();
  const resource = useResourceContext({ resource: resourceProp });
  const [update] = useUpdate();

  if (!record) return null;

  const currentState = String((record as RaRecord)[source] ?? "");
  const allAllowed = transitions[currentState] ?? [];
  const allowed = allAllowed.filter((next) => {
    const key = `${currentState}->${next}`;
    const guard = guards?.[key];
    return guard ? guard(record) : true;
  });

  const handleSelect = (next: string) => {
    if (confirm && !window.confirm(`Move to ${next}?`)) return;
    update(resource, {
      id: record.id,
      data: { [source]: next },
      previousData: record,
    });
    onTransition?.(currentState, next, record);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          data-status-trigger
          disabled={allowed.length === 0}
        >
          {currentState || "—"}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {allowed.map((next) => (
          <DropdownMenuItem key={next} onSelect={() => handleSelect(next)}>
            {next}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { StatusTransitionButton, type StatusTransitionButtonProps };
