export interface ToolDefinition {
  description: string;
  parameters: Record<string, string>;
  handler: (args: Record<string, unknown>) => Promise<unknown> | unknown;
}

export type AssistantMessage =
  | { role: "user" | "assistant" | "system"; content: string }
  | { role: "tool"; toolName: string; result: unknown };

export type AssistantChunk =
  | { type: "text"; delta: string }
  | { type: "tool-call"; toolName: string; args: Record<string, unknown> }
  | { type: "done" };

export interface AssistantTransport {
  send: (
    messages: AssistantMessage[],
    tools: Record<string, Omit<ToolDefinition, "handler">>,
  ) => AsyncIterable<AssistantChunk>;
}

/**
 * Built-in echo transport for tests/demos. Doesn't call any LLM —
 * just echoes the user's last message back as the assistant.
 */
export const echoTransport: AssistantTransport = {
  send: async function* (messages) {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const reply =
      lastUser && "content" in lastUser ? `Echo: ${lastUser.content}` : "Hi!";
    for (const char of reply) {
      yield { type: "text", delta: char };
      await new Promise((r) => setTimeout(r, 5));
    }
    yield { type: "done" };
  },
};
