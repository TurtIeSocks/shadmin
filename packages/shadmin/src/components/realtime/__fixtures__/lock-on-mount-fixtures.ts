import { fakeTransport } from "shadmin-core";
import { inMemoryLockProvider } from "shadmin-core";

export const lomTransport = fakeTransport();
export const lomLocks = inMemoryLockProvider({ publisher: lomTransport });
