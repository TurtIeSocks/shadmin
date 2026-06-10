import { StoryAdmin } from "@/test/_test-helpers";
import { ApiKeyField } from "@/components/extras";

export default {
  title: "Extras/ApiKeyField",
  parameters: { docs: { codePanel: true } },
};

export const Basic = () => (
  <StoryAdmin record={{ apiKey: "sk_live_***" }}>
    <ApiKeyField source="apiKey" />
  </StoryAdmin>
);

export const WithScopes = () => (
  <StoryAdmin
    record={{
      apiKey: "sk_live_***",
      scopes: ["read", "write"],
    }}
  >
    <ApiKeyField source="apiKey" scopesSource="scopes" />
  </StoryAdmin>
);

export const WithLastUsed = () => (
  <StoryAdmin
    record={{
      apiKey: "sk_live_***",
      lastUsedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    }}
  >
    <ApiKeyField source="apiKey" lastUsedSource="lastUsedAt" />
  </StoryAdmin>
);

export const NeverUsed = () => (
  <StoryAdmin record={{ apiKey: "sk_test_xyz", lastUsedAt: null }}>
    <ApiKeyField source="apiKey" lastUsedSource="lastUsedAt" />
  </StoryAdmin>
);

export const FullyMasked = () => (
  <StoryAdmin record={{ apiKey: "sk_live_***" }}>
    <ApiKeyField source="apiKey" maskedFormat="full" />
  </StoryAdmin>
);
