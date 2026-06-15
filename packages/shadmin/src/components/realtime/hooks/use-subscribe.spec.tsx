import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { useState } from "react";
import { RealtimeStoryAdmin } from "@/test/_test-helpers";
import { fakeTransport } from "@/components/realtime/transports/fake-transport";
import { useSubscribe } from "./use-subscribe";

function CountingProbe({
  topic,
  enabled,
}: {
  topic: string;
  enabled?: boolean;
}) {
  const [count, setCount] = useState(0);
  useSubscribe(topic, () => setCount((c) => c + 1), { enabled });
  return <div data-testid="count">{count}</div>;
}

describe("useSubscribe", () => {
  it("fires the callback when an event arrives", async () => {
    const transport = fakeTransport();
    const screen = render(
      <RealtimeStoryAdmin transport={transport}>
        <CountingProbe topic="resource/posts" />
      </RealtimeStoryAdmin>,
    );
    await transport.publish("resource/posts", { type: "created", payload: {} });
    await expect.element(screen.getByTestId("count")).toHaveTextContent("1");
  });

  it("does not subscribe when enabled is false", async () => {
    const transport = fakeTransport();
    const screen = render(
      <RealtimeStoryAdmin transport={transport}>
        <CountingProbe topic="resource/posts" enabled={false} />
      </RealtimeStoryAdmin>,
    );
    await transport.publish("resource/posts", { type: "created", payload: {} });
    await expect.element(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("uses the latest callback (ref pattern)", async () => {
    const transport = fakeTransport();
    const a = vi.fn();
    const b = vi.fn();

    function Latest({ cb }: { cb: () => void }) {
      useSubscribe("x", cb);
      return null;
    }

    const screen = render(
      <RealtimeStoryAdmin transport={transport}>
        <Latest cb={a} />
      </RealtimeStoryAdmin>,
    );
    screen.rerender(
      <RealtimeStoryAdmin transport={transport}>
        <Latest cb={b} />
      </RealtimeStoryAdmin>,
    );
    await transport.publish("x", { type: "created", payload: {} });
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);
  });
});
