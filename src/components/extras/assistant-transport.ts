interface ToolDefinition {
  description: string;
  parameters: Record<string, string>;
  handler: (args: Record<string, unknown>) => Promise<unknown> | unknown;
}

type AssistantMessage =
  | { role: "user" | "assistant" | "system"; content: string }
  | { role: "tool"; toolName: string; result: unknown };

type AssistantChunk =
  | { type: "text"; delta: string }
  | { type: "tool-call"; toolName: string; args: Record<string, unknown> }
  | { type: "done" };

interface AssistantTransport {
  send: (
    messages: AssistantMessage[],
    tools: Record<string, Omit<ToolDefinition, "handler">>,
  ) => AsyncIterable<AssistantChunk>;
}

/**
 * Built-in echo transport for tests/demos. Doesn't call any LLM —
 * just echoes the user's last message back as the assistant.
 */
const echoTransport: AssistantTransport = {
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

export {
  echoTransport,
  type ToolDefinition,
  type AssistantMessage,
  type AssistantChunk,
  type AssistantTransport,
};
