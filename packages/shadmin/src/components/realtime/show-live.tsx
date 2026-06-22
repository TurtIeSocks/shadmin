import type { ReactNode } from "react";
import { useResourceContext, useRecordContext } from "shadmin-core";
import { useQueryClient } from "@tanstack/react-query";
import { Show, type ShowProps } from "@/components/admin/views/show";
import { useSubscribeToRecord } from "shadmin-core";
import { useOnReconnect } from "shadmin-core";

export function ShowLive(props: ShowProps & { children?: ReactNode }) {
  return (
    <Show {...props}>
      <ShowLiveSubscription />
      {props.children}
    </Show>
  );
}

function ShowLiveSubscription() {
  const resource = useResourceContext();
  const record = useRecordContext();
  const queryClient = useQueryClient();
  const invalidate = () => {
    if (!resource) return;
    queryClient.invalidateQueries({
      predicate: (q) => q.queryKey[0] === resource,
    });
  };
  useSubscribeToRecord(resource ?? "", record?.id, invalidate, {
    enabled: !!resource && record?.id != null,
  });
  useOnReconnect(invalidate);
  return null;
}
