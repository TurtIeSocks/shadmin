import { useEffect, type ReactElement, type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { useStore } from "shadmin-core";
import { Badge } from "@/components/ui/badge";
import { resourceTopic } from "./topics";
import type { RealtimeEventType } from "./types";
import { useSubscribe } from "./hooks/use-subscribe";

export interface MenuLiveItemLinkProps {
  to: string;
  resource: string;
  label: ReactNode;
  icon?: ReactNode;
  events?: RealtimeEventType[];
  badgeLabel?: (count: number) => ReactNode;
}

export function MenuLiveItemLink({
  to,
  resource,
  label,
  icon,
  events = ["created"],
  badgeLabel,
}: MenuLiveItemLinkProps): ReactElement {
  const storeKey = `realtime.unread.${resource}`;
  const [count, setCount] = useStore<number>(storeKey, 0);
  const { pathname } = useLocation();

  useSubscribe(resourceTopic(resource), (event) => {
    if (events.includes(event.type)) setCount((c) => (c ?? 0) + 1);
  });

  useEffect(() => {
    if (pathname.startsWith(to) && (count ?? 0) !== 0) {
      setCount(0);
    }
  }, [pathname, to, count, setCount]);

  const safeCount = count ?? 0;
  const badgeText = badgeLabel
    ? badgeLabel(safeCount)
    : safeCount > 99
      ? "99+"
      : String(safeCount);

  return (
    <Link to={to} className="flex items-center gap-2">
      {icon}
      <span>{label}</span>
      {safeCount > 0 && (
        <Badge data-testid="menu-live-badge" variant="secondary">
          {badgeText}
        </Badge>
      )}
    </Link>
  );
}

export interface MenuLiveProps {
  items: ReadonlyArray<MenuLiveItemLinkProps>;
}

export function MenuLive({ items }: MenuLiveProps): ReactElement {
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => (
        <MenuLiveItemLink key={item.to} {...item} />
      ))}
    </nav>
  );
}
