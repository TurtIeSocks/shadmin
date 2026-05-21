import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import { useState } from "react";
import { RealtimeStoryAdmin } from "@/stories/_test-helpers";
import { fakeTransport } from "@/components/realtime/transports/fake-transport";
import { useSubscribeToRecordList } from "./use-subscribe-to-record-list";

function Probe({ resource }: { resource: string }) {
  const [count, setCount] = useState(0);
  useSubscribeToRecordList(resource, () => setCount((c) => c + 1));
  return <div data-testid="count">{count}</div>;
}

describe("useSubscribeToRecordList", () => {
  it("subscribes to resourceTopic(resource)", async () => {
    const transport = fakeTransport();
    const screen = render(
      <RealtimeStoryAdmin transport={transport}>
        <Probe resource="posts" />
      </RealtimeStoryAdmin>
    );
    await transport.publish("resource/posts", { type: "created", payload: {} });
    await expect.element(screen.getByTestId("count")).toHaveTextContent("1");
  });
});
