import { beforeEach, describe, expect, it, vi } from "vitest";

const { cert, getApps, initializeApp } = vi.hoisted(() => ({
  cert: vi.fn((credentials) => ({ credentials })),
  getApps: vi.fn(),
  initializeApp: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("firebase-admin/app", () => ({
  cert,
  getApps,
  initializeApp,
}));

const validEnv = {
  FIREBASE_ADMIN_PROJECT_ID: "syncsphere-test",
  FIREBASE_ADMIN_CLIENT_EMAIL: "firebase-admin@test.iam.gserviceaccount.com",
  FIREBASE_ADMIN_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\\nmock-key\\n-----END PRIVATE KEY-----",
};

async function loadAdminModule() {
  vi.resetModules();
  return import("./admin.js");
}

describe("Firebase Admin initializer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("FIREBASE_ADMIN_PROJECT_ID", validEnv.FIREBASE_ADMIN_PROJECT_ID);
    vi.stubEnv("FIREBASE_ADMIN_CLIENT_EMAIL", validEnv.FIREBASE_ADMIN_CLIENT_EMAIL);
    vi.stubEnv("FIREBASE_ADMIN_PRIVATE_KEY", validEnv.FIREBASE_ADMIN_PRIVATE_KEY);
    getApps.mockReturnValue([]);
    initializeApp.mockReturnValue({ name: "syncsphere-admin" });
  });

  it("initializes the named Admin app with validated credentials and newline-normalized private key", async () => {
    const { getFirebaseAdminApp } = await loadAdminModule();

    const app = getFirebaseAdminApp();

    expect(cert).toHaveBeenCalledWith({
      projectId: validEnv.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: validEnv.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: "-----BEGIN PRIVATE KEY-----\nmock-key\n-----END PRIVATE KEY-----",
    });
    expect(initializeApp).toHaveBeenCalledWith(
      {
        credential: cert.mock.results[0].value,
        projectId: validEnv.FIREBASE_ADMIN_PROJECT_ID,
      },
      "syncsphere-admin",
    );
    expect(app).toEqual({ name: "syncsphere-admin" });
  });

  it("reuses an existing named app for the same project", async () => {
    const existingApp = {
      name: "syncsphere-admin",
      options: { projectId: validEnv.FIREBASE_ADMIN_PROJECT_ID },
    };
    getApps.mockReturnValue([existingApp]);
    const { getFirebaseAdminApp } = await loadAdminModule();

    expect(getFirebaseAdminApp()).toBe(existingApp);
    expect(initializeApp).not.toHaveBeenCalled();
    expect(cert).not.toHaveBeenCalled();
  });

  it("throws a clear error when Admin configuration is incomplete", async () => {
    vi.stubEnv("FIREBASE_ADMIN_CLIENT_EMAIL", "");
    const { getFirebaseAdminApp } = await loadAdminModule();

    expect(() => getFirebaseAdminApp()).toThrow(
      "Firebase Admin configuration is incomplete. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY.",
    );
    expect(initializeApp).not.toHaveBeenCalled();
  });

  it("rejects reuse when the existing app targets a different project", async () => {
    getApps.mockReturnValue([
      {
        name: "syncsphere-admin",
        options: { projectId: "other-project" },
      },
    ]);
    const { getFirebaseAdminApp } = await loadAdminModule();

    expect(() => getFirebaseAdminApp()).toThrow(
      "The existing Firebase Admin app is configured for a different project.",
    );
    expect(initializeApp).not.toHaveBeenCalled();
  });
});
