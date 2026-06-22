import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import fakeRestProvider from "ra-data-fakerest";
import { RealtimeStoryAdmin } from "@/test/_test-helpers";
import { fakeTransport } from "shadmin-core";
import { useGetManyLive } from "shadmin-core";

function ManyProbe() {
  const { data, isPending } = useGetManyLive<{ id: number; title: string }>(
    "posts",
    { ids: [1, 2] },
  );
  if (isPending) return <div data-testid="titles">loading</div>;
  return <div data-testid="titles">{data?.map((r) => r.title).join(",")}</div>;
}

describe("useGetManyLive", () => {
  it("refreshes when any record in the list emits an event", async () => {
    const transport = fakeTransport();
    const baseDP = fakeRestProvider(
      {
        posts: [
          { id: 1, title: "a" },
          { id: 2, title: "b" },
        ],
      },
      false,
    );
    const screen = render(
      <RealtimeStoryAdmin transport={transport} baseDataProvider={baseDP}>
        <ManyProbe />
      </RealtimeStoryAdmin>,
    );
    await expect.element(screen.getByTestId("titles")).toHaveTextContent("a,b");

    await baseDP.update("posts", {
      id: 2,
      data: { id: 2, title: "z" },
      previousData: { id: 2, title: "b" },
    });
    await transport.publish("resource/posts/2", {
      type: "updated",
      payload: { id: 2 },
    });
    await expect.element(screen.getByTestId("titles")).toHaveTextContent("a,z");
  });
});
