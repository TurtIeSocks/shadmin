import fakeRestProvider from "ra-data-fakerest";
import { fakeTransport } from "@/components/realtime/transports/fake-transport";
import { realtimeDataProvider } from "@/components/realtime/realtime-data-provider";

const seed = { posts: [{ id: 1, title: "alpha" }] };

export const showTransport = fakeTransport();
export const showDataProvider = realtimeDataProvider(
  fakeRestProvider(seed, false),
  showTransport
);
