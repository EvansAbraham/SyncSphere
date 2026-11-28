export function createDocumentSnapshotCoordinator() {
  let initialized = false;
  let localRevision = 0;
  let persistedRevision = 0;

  return {
    markLocalEdit() {
      localRevision += 1;
      return localRevision;
    },
    markPersisted(revision) {
      if (!Number.isInteger(revision) || revision < 0) return;
      persistedRevision = Math.max(persistedRevision, revision);
    },
    receiveSnapshot({ isLocalWrite = false } = {}) {
      const wasInitialized = initialized;
      const hasLocalChanges = localRevision > persistedRevision;
      initialized = true;
      return {
        wasInitialized,
        initialized: true,
        hasLocalChanges,
        shouldRender: !isLocalWrite && !hasLocalChanges,
      };
    },
    get initialized() {
      return initialized;
    },
    get hasLocalChanges() {
      return localRevision > persistedRevision;
    },
    get localRevision() {
      return localRevision;
    },
  };
}
