import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import fakeRestProvider from "ra-data-fakerest";
import { RealtimeStoryAdmin } from "@/test/_test-helpers";
import { fakeTransport } from "@/components/realtime/transports/fake-transport";
import { useGetOneLive } from "./use-get-one-live";

function OneProbe() {
  const { data, isPending } = useGetOneLive<{ id: number; title: string }>(
    "posts",
    { id: 1 }
  );
  if (isPending) return <div data-testid="title">loading</div>;
  return <div data-testid="title">{data?.title ?? "none"}</div>;
}

describe("useGetOneLive", () => {
  it("refreshes when a record event arrives", async () => {
    const transport = fakeTransport();
    const baseDP = fakeRestProvider({ posts: [{ id: 1, title: "x" }] }, false);
    const screen = render(
      <RealtimeStoryAdmin transport={transport} baseDataProvider={baseDP}>
        <OneProbe />
      </RealtimeStoryAdmin>
    );
    await expect.element(screen.getByTestId("title")).toHaveTextContent("x");

    await baseDP.update("posts", {
      id: 1,
      data: { id: 1, title: "y" },
      previousData: { id: 1, title: "x" },
    });
    await transport.publish("resource/posts/1", {
      type: "updated",
      payload: { id: 1, data: { id: 1, title: "y" } },
    });

    await expect.element(screen.getByTestId("title")).toHaveTextContent("y");
  });
});
