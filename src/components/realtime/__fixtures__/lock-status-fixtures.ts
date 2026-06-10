import { fakeTransport } from "@/components/realtime/transports/fake-transport";
import { inMemoryLockProvider } from "@/components/realtime/transports/in-memory-lock-provider";

export const lsTransport = fakeTransport();
export const lsLocks = inMemoryLockProvider({ publisher: lsTransport });
// Pre-lock so the test can assert the held UI.
lsLocks.lock("posts", { id: 1, identity: "alice" });
