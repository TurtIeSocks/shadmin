import { fakeTransport } from "@/components/realtime/transports/fake-transport";
import { inMemoryLockProvider } from "@/components/realtime/transports/in-memory-lock-provider";

export const lomTransport = fakeTransport();
export const lomLocks = inMemoryLockProvider({ publisher: lomTransport });
