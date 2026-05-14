"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type RaRecord,
  useGetIdentity,
  useRecordContext,
  useResourceContext,
} from "ra-core";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface PresenceUser {
  id: string;
  name: string;
  avatar?: string;
}

export interface PresenceState {
  user: PresenceUser;
  timestamp: number;
}

export interface PresenceTransport {
  subscribe: (topic: string, handler: (state: PresenceState) => void) => () => void;
  publish: (topic: string, state: PresenceState) => void;
}

const broadcastTransport: PresenceTransport = {
  subscribe: (topic, handler) => {
    if (typeof BroadcastChannel === "undefined") return () => {};
    const channel = new BroadcastChannel(topic);
    const listener = (event: MessageEvent<PresenceState>) => {
      try {
        handler(event.data);
      } catch {
        /* swallow */
      }
    };
    channel.addEventListener("message", listener);
    return () => {
      channel.removeEventListener("message", listener);
      channel.close();
    };
  },
  publish: (topic, state) => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(topic);
    channel.postMessage(state);
    channel.close();
  },
};

export interface PresenceBarProps {
  topic?: string;
  currentUser?: PresenceUser;
  maxAvatars?: number;
  heartbeatMs?: number;
  staleMs?: number;
  transport?: PresenceTransport;
  className?: string;
}

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

export const PresenceBar = ({
  topic: topicProp,
  currentUser: currentUserProp,
  maxAvatars = 5,
  heartbeatMs = 15000,
  staleMs = 30000,
  transport = broadcastTransport,
  className,
}: PresenceBarProps) => {
  const record = useRecordContext<RaRecord>();
  const resource = useResourceContext();
  const { identity } = useGetIdentity();

  const topic = useMemo(() => {
    if (topicProp) return topicProp;
    if (resource && record?.id !== undefined) {
      return `presence/${resource}/${record.id}`;
    }
    return null;
  }, [topicProp, resource, record?.id]);

  const currentUser = useMemo<PresenceUser | null>(() => {
    if (currentUserProp) return currentUserProp;
    if (identity?.id !== undefined) {
      return {
        id: String(identity.id),
        name: String(identity.fullName ?? identity.id),
        avatar: typeof identity.avatar === "string" ? identity.avatar : undefined,
      };
    }
    return null;
  }, [currentUserProp, identity]);

  const [otherUsers, setOtherUsers] = useState<Record<string, PresenceState>>({});

  // Heartbeat: publish own presence on a timer
  useEffect(() => {
    if (!topic || !currentUser) return;
    const beat = () => {
      transport.publish(topic, { user: currentUser, timestamp: Date.now() });
    };
    beat();
    const id = window.setInterval(beat, heartbeatMs);
    return () => window.clearInterval(id);
  }, [topic, currentUser, heartbeatMs, transport]);

  // Subscribe to incoming presence updates
  useEffect(() => {
    if (!topic || !currentUser) return;
    const unsubscribe = transport.subscribe(topic, (state) => {
      if (state.user.id === currentUser.id) return; // skip self
      setOtherUsers((prev) => ({ ...prev, [state.user.id]: state }));
    });
    return unsubscribe;
  }, [topic, currentUser, transport]);

  // Drop stale users on a periodic sweep
  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now();
      setOtherUsers((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const [uid, state] of Object.entries(prev)) {
          if (now - state.timestamp > staleMs) {
            delete next[uid];
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, Math.min(staleMs / 2, 5000));
    return () => window.clearInterval(id);
  }, [staleMs]);

  const users = useMemo(() => Object.values(otherUsers).map((s) => s.user), [otherUsers]);

  if (users.length === 0) return null;

  const visible = users.slice(0, maxAvatars);
  const hiddenCount = users.length - visible.length;

  return (
    <AvatarGroup className={cn("inline-flex", className)} data-slot="presence-bar">
      {visible.map((u) => (
        <Avatar key={u.id} size="sm" data-presence-user={u.id}>
          {u.avatar ? <AvatarImage src={u.avatar} alt={u.name} /> : null}
          <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
        </Avatar>
      ))}
      {hiddenCount > 0 ? (
        <AvatarGroupCount>+{hiddenCount}</AvatarGroupCount>
      ) : null}
    </AvatarGroup>
  );
};
