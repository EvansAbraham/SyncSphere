/**
 * Executes a document save only while its originating editor session remains current.
 * In-flight Firestore writes cannot be cancelled; invalidation prevents subsequent
 * stages and stale completion callbacks, but cannot undo a write already accepted.
 */
export async function executeDocumentSaveSession({
  isCurrent,
  prepare,
  persist,
  onPersisted,
}) {
  if (!isCurrent()) return { status: "stale" };

  const payload = await prepare();
  if (!isCurrent()) return { status: "stale" };

  await persist(payload);
  if (!isCurrent()) return { status: "stale-write-completed" };

  onPersisted?.();
  return { status: "persisted" };
}
