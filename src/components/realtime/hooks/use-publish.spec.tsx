import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import { useEffect } from "react";
import { RealtimeStoryAdmin } from "@/stories/_test-helpers";
import { fakeTransport } from "@/components/realtime/transports/fake-transport";
import { usePublish } from "./use-publish";

function Publisher() {
  const publish = usePublish();
  useEffect(() => {
    publish("x", { type: "created", payload: { ids: [1] } });
  }, [publish]);
  return null;
}

describe("usePublish", () => {
  it("publishes through the dataProvider", async () => {
    const transport = fakeTransport();
    render(
      <RealtimeStoryAdmin transport={transport}>
        <Publisher />
      </RealtimeStoryAdmin>
    );
    await new Promise((r) => setTimeout(r, 0));
    expect(transport.publishedEvents).toHaveLength(1);
    expect(transport.publishedEvents[0].topic).toBe("x");
  });
});
