import { beforeEach, describe, expect, it, vi } from "vitest";

const { clerkAuth, getFirebaseAdminApp, getAuth, createCustomToken } = vi.hoisted(() => ({
  clerkAuth: vi.fn(),
  getFirebaseAdminApp: vi.fn(() => ({ name: "test-admin-app" })),
  getAuth: vi.fn(() => ({ createCustomToken: vi.fn() })),
  createCustomToken: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({ auth: clerkAuth }));
vi.mock("firebase-admin/auth", () => ({
  getAuth: vi.fn(() => ({ createCustomToken })),
}));
vi.mock("../../lib/firebase-admin/admin.js", () => ({ getFirebaseAdminApp }));
vi.mock("next/server", () => ({
  NextResponse: {
    json: (body, init) => Response.json(body, init),
  },
}));

async function loadRoute() {
  vi.resetModules();
  return import("../../app/api/auth/firebase-token/route.js");
}

function sameOriginRequest(body = {}) {
  return new Request("https://syncsphere.example/api/auth/firebase-token", {
    method: "POST",
    headers: {
      origin: "https://syncsphere.example",
      host: "syncsphere.example",
      "sec-fetch-site": "same-origin",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/firebase-token", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clerkAuth.mockResolvedValue({ userId: "clerk-user-123" });
    createCustomToken.mockResolvedValue("firebase-custom-token");
  });

  it("rejects requests without same-origin headers before authenticating", async () => {
    const { POST } = await loadRoute();
    const request = new Request("https://syncsphere.example/api/auth/firebase-token", {
      method: "POST",
      headers: { host: "syncsphere.example" },
    });

    const response = await POST(request);

    expect(response.status).toBe(403);
    expect(clerkAuth).not.toHaveBeenCalled();
    expect(createCustomToken).not.toHaveBeenCalled();
  });

  it("rejects cross-origin requests", async () => {
    const { POST } = await loadRoute();
    const request = sameOriginRequest();
    request.headers.set("origin", "https://attacker.example");

    const response = await POST(request);

    expect(response.status).toBe(403);
    expect(clerkAuth).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated requests", async () => {
    clerkAuth.mockResolvedValue({ userId: null });
    const { POST } = await loadRoute();

    const response = await POST(sameOriginRequest());

    expect(response.status).toBe(401);
    expect(createCustomToken).not.toHaveBeenCalled();
  });

  it("issues a token only for the verified Clerk user ID and does not accept caller identity", async () => {
    const { POST } = await loadRoute();
    const request = sameOriginRequest({
      uid: "attacker-controlled-uid",
      email: "attacker@example.com",
      orgId: "attacker-org",
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ token: "firebase-custom-token" });
    expect(createCustomToken).toHaveBeenCalledWith("clerk-user-123");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("pragma")).toBe("no-cache");
  });

  it("returns a generic error when token creation fails without leaking the underlying error", async () => {
    createCustomToken.mockRejectedValue(new Error("private failure detail"));
    const { POST } = await loadRoute();

    const response = await POST(sameOriginRequest());
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe("Unable to establish Firebase authentication.");
    expect(JSON.stringify(payload)).not.toContain("private failure detail");
  });
});
