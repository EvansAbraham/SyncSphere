export const WORKSPACE_DELETE_BATCH_SIZE = 200;

export function chunkDocumentIds(documentIds, chunkSize = WORKSPACE_DELETE_BATCH_SIZE) {
  if (!Number.isInteger(chunkSize) || chunkSize < 1) {
    throw new RangeError('chunkSize must be a positive integer');
  }

  const chunks = [];
  for (let index = 0; index < documentIds.length; index += chunkSize) {
    chunks.push(documentIds.slice(index, index + chunkSize));
  }
  return chunks;
}


export async function deleteWorkspaceCascade({ documentIds, deleteDocumentPair, deleteWorkspace }) {
  const chunks = chunkDocumentIds(documentIds);
  for (const chunk of chunks) {
    await deleteDocumentPair(chunk);
  }
  await deleteWorkspace();
}
