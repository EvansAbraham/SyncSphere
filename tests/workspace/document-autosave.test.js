import { describe, expect, it, vi } from "vitest";
import { createAutosaveQueue } from "../../lib/document-autosave.js";

function deferred() {
  let resolve;
  const promise = new Promise((res) => { resolve = res; });
  return { promise, resolve };
}

describe("createAutosaveQueue", () => {
  it("runs a follow-up save when edits arrive during an active save", async () => {
    const firstSave = deferred();
    const secondSaveStarted = deferred();
    const save = vi.fn()
      .mockImplementationOnce(() => firstSave.promise)
      .mockImplementationOnce(() => {
        secondSaveStarted.resolve();
        return Promise.resolve();
      });
    const queue = createAutosaveQueue(save);

    queue.notify();
    expect(save).toHaveBeenCalledTimes(1);

    queue.notify();
    queue.notify();
    expect(save).toHaveBeenCalledTimes(1);

    firstSave.resolve();
    await secondSaveStarted.promise;
    expect(save).toHaveBeenCalledTimes(2);
    queue.dispose();
  });

  it("coalesces multiple changes during a save into one follow-up save", async () => {
    const firstSave = deferred();
    const secondSaveStarted = deferred();
    const save = vi.fn()
      .mockImplementationOnce(() => firstSave.promise)
      .mockImplementationOnce(() => {
        secondSaveStarted.resolve();
        return Promise.resolve();
      });
    const queue = createAutosaveQueue(save);

    queue.notify();
    queue.notify();
    queue.notify();
    queue.notify();
    firstSave.resolve();
    await secondSaveStarted.promise;

    expect(save).toHaveBeenCalledTimes(2);
    queue.dispose();
  });

  it("does not start a queued save after disposal", async () => {
    const firstSave = deferred();
    const save = vi.fn().mockImplementation(() => firstSave.promise);
    const queue = createAutosaveQueue(save);

    queue.notify();
    queue.notify();
    queue.dispose();
    firstSave.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(save).toHaveBeenCalledTimes(1);
  });

  it("does not queue work when the session is inactive", () => {
    const save = vi.fn();
    const queue = createAutosaveQueue(save, () => false);

    queue.notify();

    expect(save).not.toHaveBeenCalled();
  });
});
