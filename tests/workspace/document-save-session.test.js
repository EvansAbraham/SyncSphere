import { describe, expect, it, vi } from "vitest";
import { executeDocumentSaveSession } from "../../lib/document-save-session.js";

function deferred() {
  let resolve;
  const promise = new Promise((res) => { resolve = res; });
  return { promise, resolve };
}

describe("executeDocumentSaveSession", () => {
  it("does not prepare or write when the session is already stale", async () => {
    const prepare = vi.fn();
    const persist = vi.fn();
    const onPersisted = vi.fn();

    const result = await executeDocumentSaveSession({
      isCurrent: () => false,
      prepare,
      persist,
      onPersisted,
    });

    expect(result.status).toBe("stale");
    expect(prepare).not.toHaveBeenCalled();
    expect(persist).not.toHaveBeenCalled();
    expect(onPersisted).not.toHaveBeenCalled();
  });

  it("stops before persistence when the session becomes stale during preparation", async () => {
    const preparation = deferred();
    let current = true;
    const persist = vi.fn();
    const onPersisted = vi.fn();

    const pending = executeDocumentSaveSession({
      isCurrent: () => current,
      prepare: () => preparation.promise,
      persist,
      onPersisted,
    });
    current = false;
    preparation.resolve({ snapshot: "prepared" });

    const result = await pending;
    expect(result.status).toBe("stale");
    expect(persist).not.toHaveBeenCalled();
    expect(onPersisted).not.toHaveBeenCalled();
  });

  it("does not mark persisted when a Firestore write completes after invalidation", async () => {
    const write = deferred();
    const writeStarted = deferred();
    let current = true;
    const onPersisted = vi.fn();

    const pending = executeDocumentSaveSession({
      isCurrent: () => current,
      prepare: async () => ({ snapshot: "prepared" }),
      persist: () => {
        writeStarted.resolve();
        return write.promise;
      },
      onPersisted,
    });
    await writeStarted.promise;
    current = false;
    write.resolve();

    const result = await pending;
    expect(result.status).toBe("stale-write-completed");
    expect(onPersisted).not.toHaveBeenCalled();
  });

  it("marks the captured revision persisted only when the session stays current", async () => {
    const onPersisted = vi.fn();
    const persist = vi.fn().mockResolvedValue(undefined);

    const result = await executeDocumentSaveSession({
      isCurrent: () => true,
      prepare: async () => ({ revision: 3, snapshot: "saved" }),
      persist,
      onPersisted,
    });

    expect(result.status).toBe("persisted");
    expect(persist).toHaveBeenCalledWith({ revision: 3, snapshot: "saved" });
    expect(onPersisted).toHaveBeenCalledOnce();
  });
});
