import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import { RealtimeStoryAdmin } from "@/test/_test-helpers";
import { fakeTransport } from "@/components/realtime/transports/fake-transport";
import { useRealtimeStatus } from "./use-realtime-status";

function Probe() {
  const { status } = useRealtimeStatus();
  return <div data-testid="status">{status}</div>;
}

describe("useRealtimeStatus", () => {
  it("returns 'idle' when transport does not implement onStatusChange", async () => {
    const transport = fakeTransport();
    const screen = render(
      <RealtimeStoryAdmin transport={transport}>
        <Probe />
      </RealtimeStoryAdmin>,
    );
    await expect
      .element(screen.getByTestId("status"))
      .toHaveTextContent("idle");
  });
});
