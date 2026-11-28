export function createAutosaveQueue(save, isActive = () => true) {
  let running = false;
  let dirty = false;
  let disposed = false;

  const run = async () => {
    if (running || disposed) return;
    running = true;
    try {
      while (dirty && !disposed && isActive()) {
        dirty = false;
        try {
          await save();
        } catch {
          // The caller owns save-error reporting; keep the queue alive for later edits.
        }
      }
    } finally {
      running = false;
      if (dirty && !disposed && isActive()) {
        void run();
      }
    }
  };

  return {
    notify() {
      if (disposed || !isActive()) return;
      dirty = true;
      void run();
    },
    dispose() {
      disposed = true;
      dirty = false;
    },
  };
}
