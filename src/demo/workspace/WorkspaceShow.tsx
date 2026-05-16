import { useEffect, useMemo } from "react";
import { useRecordContext } from "ra-core";
import {
  Assistant,
  type AssistantTransport,
  PresenceBar,
  type PresenceState,
  type PresenceTransport,
  RecordField,
  Show,
  SimpleShowLayout,
} from "@/components/admin";
import type { WorkspaceDocument } from "./documents-seed";

/**
 * In-memory presence transport — bypasses BroadcastChannel so the demo
 * works in test runners and shows collaborators without a backend.
 */
class InMemoryPresenceTransport implements PresenceTransport {
  private channels: Record<string, Array<(s: PresenceState) => void>> = {};
  subscribe = (topic: string, handler: (s: PresenceState) => void) => {
    (this.channels[topic] ??= []).push(handler);
    return () => {
      this.channels[topic] = (this.channels[topic] ?? []).filter(
        (h) => h !== handler,
      );
    };
  };
  publish = (topic: string, state: PresenceState) => {
    for (const h of this.channels[topic] ?? []) h(state);
  };
}

const presenceTransport: PresenceTransport = new InMemoryPresenceTransport();

/**
 * Seeds the PresenceBar transport with the document's collaborators so the
 * avatars actually appear without needing real peers.
 */
const SeedCollaborators = ({ topic }: { topic: string }) => {
  const record = useRecordContext<WorkspaceDocument>();
  useEffect(() => {
    if (!record?.collaborators) return;
    for (const collab of record.collaborators) {
      presenceTransport.publish(topic, {
        user: { id: collab.id, name: collab.name },
        timestamp: Date.now(),
      });
    }
  }, [record, topic]);
  return null;
};

/**
 * Mock Assistant transport that "summarizes" the document by streaming a
 * short canned reply mentioning the document title. Replace with a real LLM
 * transport (e.g. OpenAI / Anthropic) to get true summaries.
 */
const useSummarizeTransport = (
  record: WorkspaceDocument | undefined,
): AssistantTransport =>
  useMemo<AssistantTransport>(
    () => ({
      send: async function* (messages) {
        const lastUser = [...messages].reverse().find((m) => m.role === "user");
        const ask =
          lastUser && "content" in lastUser ? lastUser.content : "summary";
        const reply = record
          ? `Here's a quick take on "${record.title}" (you asked: ${ask}):\n\n${record.body.split("\n").slice(0, 3).join(" ")}…`
          : `You asked: ${ask}`;
        for (const ch of reply) {
          yield { type: "text", delta: ch };
          await new Promise((r) => setTimeout(r, 4));
        }
        yield { type: "done" };
      },
    }),
    [record],
  );

const DocumentBody = () => {
  const record = useRecordContext<WorkspaceDocument>();
  if (!record) return null;
  return (
    <pre className="rounded-md border bg-muted/40 p-3 text-sm whitespace-pre-wrap font-sans">
      {record.body}
    </pre>
  );
};

const DocumentAssistant = () => {
  const record = useRecordContext<WorkspaceDocument>();
  const transport = useSummarizeTransport(record);
  return (
    <Assistant
      transport={transport}
      placement="sidebar"
      triggerLabel="Summarize"
      welcomeMessage={
        record
          ? `Ask me anything about "${record.title}".`
          : "Loading document…"
      }
    />
  );
};

const ShowHeader = () => {
  const record = useRecordContext<WorkspaceDocument>();
  if (!record) return null;
  const topic = `presence/documents/${record.id}`;
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="text-sm text-muted-foreground">
        {record.collaborators.length} collaborator
        {record.collaborators.length === 1 ? "" : "s"}
      </div>
      <div className="flex items-center gap-2">
        <PresenceBar
          topic={topic}
          currentUser={{ id: "you", name: "You" }}
          transport={presenceTransport}
        />
        <SeedCollaborators topic={topic} />
      </div>
    </div>
  );
};

export const WorkspaceShow = () => (
  <Show>
    <ShowHeader />
    <SimpleShowLayout>
      <RecordField source="title" />
      <RecordField source="body" label="Body">
        <DocumentBody />
      </RecordField>
    </SimpleShowLayout>
    <DocumentAssistant />
  </Show>
);
