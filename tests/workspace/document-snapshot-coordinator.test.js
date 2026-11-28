import { describe, expect, it } from "vitest";
import { createDocumentSnapshotCoordinator } from "../../lib/document-snapshot-coordinator.js";

describe("document snapshot coordinator", () => {
  it("allows initial snapshot rendering when no local edits occurred", () => {
    const coordinator = createDocumentSnapshotCoordinator();
    const decision = coordinator.receiveSnapshot();
    expect(decision.wasInitialized).toBe(false);
    expect(decision.shouldRender).toBe(true);
    expect(coordinator.initialized).toBe(true);
    expect(coordinator.hasLocalChanges).toBe(false);
  });

  it("renders the initial snapshot even when it was authored by the current user", () => {
    const coordinator = createDocumentSnapshotCoordinator();
    const decision = coordinator.receiveSnapshot({ isLocalWrite: true });
    expect(decision.wasInitialized).toBe(false);
    expect(decision.shouldRender).toBe(true);
    expect(coordinator.initialized).toBe(true);
  });

  it("preserves edits made before the initial snapshot arrives", () => {
    const coordinator = createDocumentSnapshotCoordinator();
    coordinator.markLocalEdit();
    const decision = coordinator.receiveSnapshot();
    expect(decision.wasInitialized).toBe(false);
    expect(decision.hasLocalChanges).toBe(true);
    expect(decision.shouldRender).toBe(false);
    expect(coordinator.initialized).toBe(true);
  });

  it("does not replace local edits with remote snapshots while dirty", () => {
    const coordinator = createDocumentSnapshotCoordinator();
    coordinator.receiveSnapshot();
    coordinator.markLocalEdit();
    const decision = coordinator.receiveSnapshot({ isLocalWrite: false });
    expect(decision.shouldRender).toBe(false);
    expect(decision.hasLocalChanges).toBe(true);
  });

  it("permits remote snapshot rendering after the local revision is persisted", () => {
    const coordinator = createDocumentSnapshotCoordinator();
    coordinator.receiveSnapshot();
    const revision = coordinator.markLocalEdit();
    coordinator.markPersisted(revision);
    const decision = coordinator.receiveSnapshot({ isLocalWrite: false });
    expect(decision.shouldRender).toBe(true);
    expect(decision.hasLocalChanges).toBe(false);
  });

  it("renders the first local snapshot but ignores subsequent local-write echoes", () => {
    const coordinator = createDocumentSnapshotCoordinator();
    const initial = coordinator.receiveSnapshot({ isLocalWrite: true });
    const echo = coordinator.receiveSnapshot({ isLocalWrite: true });
    expect(initial.shouldRender).toBe(true);
    expect(echo.wasInitialized).toBe(true);
    expect(echo.shouldRender).toBe(false);
    expect(coordinator.initialized).toBe(true);
  });

  it("does not clear newer edits when an earlier revision is marked persisted", () => {
    const coordinator = createDocumentSnapshotCoordinator();
    coordinator.receiveSnapshot();
    const first = coordinator.markLocalEdit();
    const second = coordinator.markLocalEdit();
    coordinator.markPersisted(first);
    expect(coordinator.localRevision).toBe(second);
    expect(coordinator.hasLocalChanges).toBe(true);
  });
});
