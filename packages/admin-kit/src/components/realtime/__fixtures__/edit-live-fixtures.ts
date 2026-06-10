import fakeRestProvider from "ra-data-fakerest";
import { fakeTransport } from "@/components/realtime/transports/fake-transport";
import { realtimeDataProvider } from "@/components/realtime/realtime-data-provider";

const seed = { posts: [{ id: 1, title: "alpha" }] };

export const editTransport = fakeTransport();
export const editDataProvider = realtimeDataProvider(
  fakeRestProvider(seed, false),
  editTransport
);
