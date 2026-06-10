"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessageCircleIcon, SendIcon, XIcon } from "lucide-react";
import { useTranslate } from "ra-core";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  AssistantMessage,
  AssistantTransport,
  ToolDefinition,
} from "./assistant-transport";

interface AssistantProps {
  transport: AssistantTransport;
  tools?: Record<string, ToolDefinition>;
  placement?: "bottom-right" | "bottom-left" | "sidebar";
  triggerLabel?: string;
  welcomeMessage?: string;
}

const EMPTY_TOOLS: Record<string, ToolDefinition> = {};

const Assistant = ({
  transport,
  tools = EMPTY_TOOLS,
  placement = "bottom-right",
  triggerLabel,
  welcomeMessage,
}: AssistantProps) => {
  const translate = useTranslate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  const declarations = useMemo(() => {
    const out: Record<string, Omit<ToolDefinition, "handler">> = {};
    for (const [name, def] of Object.entries(tools)) {
      out[name] = { description: def.description, parameters: def.parameters };
    }
    return out;
  }, [tools]);

  const send = useCallback(
    async (userText: string) => {
      if (!userText.trim() || streaming) return;
      const updated: AssistantMessage[] = [
        ...messages,
        { role: "user", content: userText },
      ];
      setMessages(updated);
      setInput("");
      setStreaming(true);

      let assistantText = "";
      const conversationToSend = [...updated];
      try {
        for await (const chunk of transport.send(
          conversationToSend,
          declarations,
        )) {
          if (chunk.type === "text") {
            assistantText += chunk.delta;
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (last && last.role === "assistant" && "content" in last) {
                next[next.length - 1] = { ...last, content: assistantText };
              } else {
                next.push({ role: "assistant", content: assistantText });
              }
              return next;
            });
          } else if (chunk.type === "tool-call") {
            const tool = tools[chunk.toolName];
            if (!tool) {
              setMessages((prev) => [
                ...prev,
                {
                  role: "tool",
                  toolName: chunk.toolName,
                  result: {
                    error: `Tool "${chunk.toolName}" not registered`,
                  },
                },
              ]);
              continue;
            }
            try {
              const result = await tool.handler(chunk.args);
              setMessages((prev) => [
                ...prev,
                { role: "tool", toolName: chunk.toolName, result },
              ]);
            } catch (err) {
              setMessages((prev) => [
                ...prev,
                {
                  role: "tool",
                  toolName: chunk.toolName,
                  result: { error: String(err) },
                },
              ]);
            }
          }
        }
      } finally {
        setStreaming(false);
      }
    },
    [messages, declarations, transport, tools, streaming],
  );

  const label = triggerLabel ?? translate("ra.assistant.trigger", { _: "Ask" });
  const welcome =
    welcomeMessage ??
    translate("ra.assistant.welcome", { _: "Hi! Ask me anything." });

  const positionClass =
    placement === "bottom-left"
      ? "bottom-4 left-4"
      : placement === "sidebar"
        ? "top-4 right-4"
        : "bottom-4 right-4";

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn("fixed z-50 gap-2 rounded-full shadow-lg", positionClass)}
        data-slot="assistant-trigger"
      >
        <MessageCircleIcon className="size-4" />
        {label}
      </Button>
      {open ? (
        <div
          data-slot="assistant-panel"
          className={cn(
            "fixed z-50 flex max-h-[80vh] w-96 flex-col rounded-md border bg-background shadow-xl",
            placement === "bottom-left" && "bottom-20 left-4",
            placement === "bottom-right" && "bottom-20 right-4",
            placement === "sidebar" && "top-20 right-4",
          )}
        >
          <div className="flex items-center justify-between border-b p-3">
            <div className="text-sm font-medium">{label}</div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded-md p-1 text-muted-foreground hover:bg-accent"
            >
              <XIcon className="size-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {messages.length === 0 ? (
              <div className="text-sm text-muted-foreground">{welcome}</div>
            ) : (
              <div className="flex flex-col gap-2">
                {messages.map((m, idx) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: AssistantMessage (public API type) carries no id; the list is append-only (never reordered or spliced), so index is stable
                  <MessageBubble key={idx} message={m} />
                ))}
                {streaming ? (
                  <div className="text-xs italic text-muted-foreground">
                    {translate("ra.assistant.thinking", { _: "Thinking…" })}
                  </div>
                ) : null}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          <form
            className="flex gap-2 border-t p-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={translate("ra.assistant.placeholder", {
                _: "Ask…",
              })}
              disabled={streaming}
              data-slot="assistant-input"
              className="flex-1 rounded-md border bg-background px-2 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button
              type="submit"
              size="icon-sm"
              disabled={streaming || !input.trim()}
            >
              <SendIcon className="size-3" />
            </Button>
          </form>
        </div>
      ) : null}
    </>
  );
};

const MessageBubble = ({ message }: { message: AssistantMessage }) => {
  if (message.role === "tool") {
    return (
      <div className="rounded-md bg-muted/40 px-2 py-1 text-xs font-mono">
        {"🔧"} {message.toolName} &rarr;{" "}
        {typeof message.result === "string"
          ? message.result
          : JSON.stringify(message.result)}
      </div>
    );
  }
  const isUser = message.role === "user";
  return (
    <div
      data-role={message.role}
      className={cn(
        "max-w-[85%] rounded-md px-2 py-1 text-sm",
        isUser
          ? "self-end bg-primary text-primary-foreground"
          : "self-start bg-muted",
      )}
    >
      {message.content}
    </div>
  );
};

export { type AssistantProps, Assistant };
