import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import fakeRestProvider from "ra-data-fakerest";
import { RealtimeStoryAdmin } from "@/test/_test-helpers";
import { fakeTransport } from "@/components/realtime/transports/fake-transport";
import { useGetListLive } from "./use-get-list-live";

function ListProbe() {
  const { data, isPending } = useGetListLive("posts", {
    pagination: { page: 1, perPage: 10 },
    sort: { field: "id", order: "ASC" },
    filter: {},
  });
  if (isPending) return <div data-testid="status">loading</div>;
  return <div data-testid="count">{data?.length ?? 0}</div>;
}

describe("useGetListLive", () => {
  it("returns initial data and updates on a created event", async () => {
    const transport = fakeTransport();
    const baseDP = fakeRestProvider({ posts: [{ id: 1, title: "x" }] }, false);

    const screen = render(
      <RealtimeStoryAdmin transport={transport} baseDataProvider={baseDP}>
        <ListProbe />
      </RealtimeStoryAdmin>
    );

    await expect.element(screen.getByTestId("count")).toHaveTextContent("1");

    await baseDP.create("posts", { data: { id: 2, title: "y" } });
    await transport.publish("resource/posts", {
      type: "created",
      payload: { ids: [2] },
    });

    await expect.element(screen.getByTestId("count")).toHaveTextContent("2");
  });
});
