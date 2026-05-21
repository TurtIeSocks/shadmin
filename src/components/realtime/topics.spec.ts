import { describe, it, expect } from "vitest";
import {
  resourceTopic,
  recordTopic,
  lockResourceTopic,
  lockTopic,
} from "./topics";

describe("topic helpers", () => {
  it("resourceTopic formats a resource topic", () => {
    expect(resourceTopic("posts")).toBe("resource/posts");
  });

  it("recordTopic formats a record topic", () => {
    expect(recordTopic("posts", 42)).toBe("resource/posts/42");
  });

  it("recordTopic handles string ids", () => {
    expect(recordTopic("users", "abc-123")).toBe("resource/users/abc-123");
  });

  it("lockResourceTopic formats a lock collection topic", () => {
    expect(lockResourceTopic("posts")).toBe("lock/posts");
  });

  it("lockTopic formats a lock record topic", () => {
    expect(lockTopic("posts", 42)).toBe("lock/posts/42");
  });
});
