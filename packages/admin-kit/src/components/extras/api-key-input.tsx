import { useState } from "react";
import { useRecordContext, useResourceContext, useUpdate } from "ra-core";
import type { RaRecord } from "ra-core";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RefreshCw } from "lucide-react";

/**
 * API-key rotation control. Renders a single Rotate button that opens a
 * confirmation dialog. On confirm, calls `onRotate(record)` if provided, or
 * dispatches `useUpdate(resource, { id, data: { [source]: null } })` to
 * trigger server-side regeneration.
 *
 * @example
 * <ApiKeyInput source="apiKey" />
 * <ApiKeyInput source="apiKey" onRotate={async (record) => await regenKey(record.id)} />
 */
function ApiKeyInput(props: ApiKeyInputProps) {
  const { source, onRotate, disabled, resource: resourceProp } = props;
  const record = useRecordContext();
  const resource = useResourceContext({ resource: resourceProp });
  const [update] = useUpdate();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const handleRotate = async () => {
    setPending(true);
    try {
      if (onRotate && record) {
        await onRotate(record);
      } else if (record) {
        await update(resource, {
          id: record.id,
          data: { [source]: null },
          previousData: record,
        });
      }
    } finally {
      setPending(false);
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          data-rotate-button
          disabled={disabled}
        >
          <RefreshCw />
          Rotate
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Rotate API key?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure? The current key will be revoked immediately. Any
            integrations still using it will break until they're updated.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRotate} disabled={pending}>
            {pending ? "Rotating…" : "Rotate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface ApiKeyInputProps {
  /** Record field holding the API key. Defaults to `"apiKey"`. */
  source: string;
  /** Override resource. */
  resource?: string;
  /** Async side-effect on rotate. When provided, replaces the default useUpdate call. */
  onRotate?: (record: RaRecord) => Promise<void> | void;
  /** Disable the button. */
  disabled?: boolean;
}

export { ApiKeyInput, type ApiKeyInputProps };
