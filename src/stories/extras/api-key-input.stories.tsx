import { StoryAdmin } from "@/stories/_test-helpers";
import { ApiKeyInput } from "@/components/admin";

export default {
  title: "Extras/ApiKeyInput",
  parameters: { docs: { codePanel: true } },
};

export const Basic = () => (
  <StoryAdmin record={{ id: 1, apiKey: "sk_live_abc123" }}>
    <ApiKeyInput source="apiKey" />
  </StoryAdmin>
);

export const WithCustomRotate = () => (
  <StoryAdmin record={{ id: 1, apiKey: "sk_live_abc123" }}>
    <ApiKeyInput
      source="apiKey"
      onRotate={async () => {
        // eslint-disable-next-line no-alert
        alert("Rotating key…");
      }}
    />
  </StoryAdmin>
);

export const Disabled = () => (
  <StoryAdmin record={{ id: 1, apiKey: "sk_live_abc123" }}>
    <ApiKeyInput source="apiKey" disabled />
  </StoryAdmin>
);

export const WithCustomResource = () => (
  <StoryAdmin record={{ id: 42, apiKey: "sk_live_xyz789" }}>
    <ApiKeyInput source="apiKey" resource="tokens" />
  </StoryAdmin>
);
