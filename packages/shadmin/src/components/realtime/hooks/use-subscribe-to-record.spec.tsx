import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import { useState } from "react";
import type { Identifier } from "shadmin-core";
import { RealtimeStoryAdmin } from "@/test/_test-helpers";
import { fakeTransport } from "@/components/realtime/transports/fake-transport";
import { useSubscribeToRecord } from "./use-subscribe-to-record";

function Probe({ resource, id }: { resource: string; id?: Identifier }) {
  const [count, setCount] = useState(0);
  useSubscribeToRecord(resource, id, () => setCount((c) => c + 1));
  return <div data-testid="count">{count}</div>;
}

describe("useSubscribeToRecord", () => {
  it("subscribes to recordTopic(resource, id)", async () => {
    const transport = fakeTransport();
    const screen = render(
      <RealtimeStoryAdmin transport={transport}>
        <Probe resource="posts" id={42} />
      </RealtimeStoryAdmin>,
    );
    await transport.publish("resource/posts/42", {
      type: "updated",
      payload: {},
    });
    await expect.element(screen.getByTestId("count")).toHaveTextContent("1");
  });

  it("no-ops when id is undefined", async () => {
    const transport = fakeTransport();
    const screen = render(
      <RealtimeStoryAdmin transport={transport}>
        <Probe resource="posts" id={undefined} />
      </RealtimeStoryAdmin>,
    );
    await transport.publish("resource/posts/42", {
      type: "updated",
      payload: {},
    });
    await expect.element(screen.getByTestId("count")).toHaveTextContent("0");
  });
});
