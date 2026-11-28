import { beforeEach, describe, expect, it, vi } from "vitest";

const { initializeApp, getFirestore } = vi.hoisted(() => ({
  initializeApp: vi.fn((config) => ({ config })),
  getFirestore: vi.fn((app) => ({ app }),
}));

vi.mock("firebase/app", () => ({ initializeApp }));
vi.mock("firebase/firestore", () => ({ getFirestore }));

const validClientEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "test-api-key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "syncsphere-test.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "syncsphere-test",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "syncsphere-test.appspot.com",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123456789",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:123456789:web:test-app-id",
};

async function loadClientConfig() {
  vi.resetModules();
  return import("../../config/firebaseConfig.js");
}

describe("Firebase Client configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const [key, value] of Object.entries(validClientEnv)) {
      vi.stubEnv(key, value);
    }
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID", "");
  });

  it("initializes with required explicit environment configuration and no fallback values", async () => {
    await loadClientConfig();

    expect(initializeApp).toHaveBeenCalledWith({
      apiKey: validClientEnv.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: validClientEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: validClientEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: validClientEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: validClientEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: validClientEnv.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: "",
    });
    expect(getFirestore).toHaveBeenCalledWith(initializeApp.mock.results[0].value);
  });

  it("throws a clear error if required Client configuration is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "");

    await expect(loadClientConfig()).rejects.toThrow(
      "Firebase Client configuration is incomplete. Set NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, and NEXT_PUBLIC_FIREBASE_APP_ID.",
    );
    expect(initializeApp).not.toHaveBeenCalled();
  });
});
