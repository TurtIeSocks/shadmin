import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import { useEffect, useState } from "react";
import { RealtimeStoryAdmin } from "@/test/_test-helpers";
import { fakeTransport } from "shadmin-core";
import { useSubscribeCallback } from "shadmin-core";

function ImperativeProbe() {
  const subscribe = useSubscribeCallback();
  const [received, setReceived] = useState<unknown>(null);
  useEffect(() => {
    const unsub = subscribe("x", (event) => setReceived(event));
    return unsub;
  }, [subscribe]);
  return <div data-testid="value">{received ? "yes" : "no"}</div>;
}

describe("useSubscribeCallback", () => {
  it("returns a stable subscribe fn", async () => {
    const transport = fakeTransport();
    const screen = render(
      <RealtimeStoryAdmin transport={transport}>
        <ImperativeProbe />
      </RealtimeStoryAdmin>,
    );
    await transport.publish("x", { type: "created", payload: {} });
    await expect.element(screen.getByTestId("value")).toHaveTextContent("yes");
  });
});
