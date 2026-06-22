import type { ReactNode } from "react";
import { useResourceContext } from "shadmin-core";
import { useQueryClient } from "@tanstack/react-query";
import { List, type ListProps } from "@/components/admin/list/list";
import { useSubscribeToRecordList } from "shadmin-core";
import { useOnReconnect } from "shadmin-core";

export function ListLive(props: ListProps & { children?: ReactNode }) {
  return (
    <List {...props}>
      <ListLiveSubscription />
      {props.children}
    </List>
  );
}

function ListLiveSubscription() {
  const resource = useResourceContext();
  const queryClient = useQueryClient();
  const invalidate = () => {
    if (!resource) return;
    queryClient.invalidateQueries({
      predicate: (q) => q.queryKey[0] === resource,
    });
  };
  useSubscribeToRecordList(resource ?? "", invalidate, { enabled: !!resource });
  useOnReconnect(invalidate);
  return null;
}
