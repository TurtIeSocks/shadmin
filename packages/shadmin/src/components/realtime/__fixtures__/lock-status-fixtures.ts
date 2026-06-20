import { fakeTransport } from "shadmin-core";
import { inMemoryLockProvider } from "shadmin-core";

export const lsTransport = fakeTransport();
export const lsLocks = inMemoryLockProvider({ publisher: lsTransport });
// Pre-lock so the test can assert the held UI.
lsLocks.lock("posts", { id: 1, identity: "alice" });
