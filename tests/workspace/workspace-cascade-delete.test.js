import { describe, expect, it, vi } from "vitest";
import { chunkDocumentIds, deleteWorkspaceCascade, WORKSPACE_DELETE_BATCH_SIZE } from "../../lib/workspace-cascade-delete.js";

describe("workspace cascade deletion", () => {
  it("chunks document IDs so paired deletes fit below Firestore batch limits", () => {
    const ids = Array.from({ length: 501 }, (_, index) => String(index));
    const chunks = chunkDocumentIds(ids);
    expect(chunks.map((chunk) => chunk.length)).toEqual([200, 200, 101]);
    expect(chunks.flat()).toEqual(ids);
    expect(chunks.every((chunk) => chunk.length <= WORKSPACE_DELETE_BATCH_SIZE)).toBe(true);
  });


  it("deletes the workspace parent after all child chunks succeed", async () => {
    const deleteDocumentPair = vi.fn().mockResolvedValue(undefined);
    const deleteWorkspace = vi.fn().mockResolvedValue(undefined);
    await deleteWorkspaceCascade({
      documentIds: ["a", "b", "c"],
      deleteDocumentPair,
      deleteWorkspace,
    });
    expect(deleteDocumentPair).toHaveBeenCalledWith(["a", "b", "c"]);
    expect(deleteWorkspace).toHaveBeenCalledTimes(1);
  });


  it("does not delete the parent when a child chunk fails", async () => {
    const deleteDocumentPair = vi.fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("batch failed"));
    const deleteWorkspace = vi.fn();
    await expect(deleteWorkspaceCascade({
      documentIds: Array.from({ length: 201 }, (_, index) => String(index)),
      deleteDocumentPair,
      deleteWorkspace,
    })).rejects.toThrow("batch failed");
    expect(deleteDocumentPair).toHaveBeenCalledTimes(2);
    expect(deleteWorkspace).not.toHaveBeenCalled();
  });


  it("deletes an empty workspace without child batches", async () => {
    const deleteDocumentPair = vi.fn();
    const deleteWorkspace = vi.fn().mockResolvedValue(undefined);
    await deleteWorkspaceCascade({ documentIds: [], deleteDocumentPair, deleteWorkspace });
    expect(deleteDocumentPair).not.toHaveBeenCalled();
    expect(deleteWorkspace).toHaveBeenCalledTimes(1);
  });


  it("supports retry after partial progress because successful batches are already removed", async () => {
    const deleteDocumentPair = vi.fn()
      .mockRejectedValueOnce(new Error("transient"))
      .mockResolvedValue(undefined);
    const deleteWorkspace = vi.fn().mockResolvedValue(undefined);
    const ids = ["retry-1"];
    await expect(deleteWorkspaceCascade({ documentIds: ids, deleteDocumentPair, deleteWorkspace })).rejects.toThrow("transient");
    await deleteWorkspaceCascade({ documentIds: ids, deleteDocumentPair, deleteWorkspace });
    expect(deleteDocumentPair).toHaveBeenCalledTimes(2);
    expect(deleteWorkspace).toHaveBeenCalledTimes(1);
  });
});
