import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import { useState } from "react";
import { RealtimeStoryAdmin } from "@/test/_test-helpers";
import { fakeTransport } from "@/components/realtime/transports/fake-transport";
import { useOnReconnect } from "./use-on-reconnect";

function Probe() {
  const [count, setCount] = useState(0);
  useOnReconnect(() => setCount((c) => c + 1));
  return <div data-testid="count">{count}</div>;
}

describe("useOnReconnect", () => {
  it("fires after simulateReconnect", async () => {
    const transport = fakeTransport();
    const screen = render(
      <RealtimeStoryAdmin transport={transport}>
        <Probe />
      </RealtimeStoryAdmin>
    );
    transport.simulateReconnect();
    await expect.element(screen.getByTestId("count")).toHaveTextContent("1");
  });
});
