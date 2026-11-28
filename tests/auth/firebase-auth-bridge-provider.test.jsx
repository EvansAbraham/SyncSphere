import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";

const { clerkAuth, firebaseSignIn, firebaseSignOut, firebaseAuth } = vi.hoisted(() => ({
  clerkAuth: vi.fn(),
  firebaseSignIn: vi.fn(),
  firebaseSignOut: vi.fn(),
  firebaseAuth: { currentUser: null },
}));

vi.mock("@clerk/nextjs", () => ({ useAuth: clerkAuth }));
vi.mock("firebase/auth", () => ({
  signInWithCustomToken: firebaseSignIn,
  signOut: firebaseSignOut,
}));
vi.mock("../../config/firebaseAuth", () => ({ auth: firebaseAuth }));

import { FirebaseAuthBridgeProvider, useFirebaseAuthBridge } from "../../app/providers/FirebaseAuthBridge.jsx";

function BridgeState() {
  const state = useFirebaseAuthBridge();
  return <div data-testid="bridge-state">{state.status}:{state.firebaseUid ?? "none"}</div>;
}

describe("FirebaseAuthBridgeProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firebaseAuth.currentUser = null;
    clerkAuth.mockReturnValue({ isLoaded: true, userId: "clerk-user-1" });
    firebaseSignOut.mockImplementation(async () => {
      firebaseAuth.currentUser = null;
    });
    firebaseSignIn.mockImplementation(async (_auth, token) => {
      const uid = token === "token-1" ? "clerk-user-1" : "clerk-user-2";
      const user = { uid };
      firebaseAuth.currentUser = user;
      return { user };
    });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: "token-1" }),
    });
  });

  it("exchanges the server token and exposes authenticated readiness", async () => {
    render(
      <FirebaseAuthBridgeProvider>
        <BridgeState />
      </FirebaseAuthBridgeProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("bridge-state")).toHaveTextContent("authenticated:clerk-user-1"));
    expect(global.fetch).toHaveBeenCalledWith("/api/auth/firebase-token", expect.objectContaining({
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
    }));
    expect(firebaseSignIn).toHaveBeenCalledWith(firebaseAuth, "token-1");
  });

  it("clears Firebase Auth when Clerk is signed out", async () => {
    clerkAuth.mockReturnValue({ isLoaded: true, userId: null });
    firebaseAuth.currentUser = { uid: "previous-user" };

    render(
      <FirebaseAuthBridgeProvider>
        <BridgeState />
      </FirebaseAuthBridgeProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("bridge-state")).toHaveTextContent("signed-out:none"));
    expect(firebaseSignOut).toHaveBeenCalledWith(firebaseAuth);
    expect(firebaseSignIn).not.toHaveBeenCalled();
  });

  it("signs out a different Firebase UID before switching accounts", async () => {
    firebaseAuth.currentUser = { uid: "clerk-user-old" };

    render(
      <FirebaseAuthBridgeProvider>
        <BridgeState />
      </FirebaseAuthBridgeProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("bridge-state")).toHaveTextContent("authenticated:clerk-user-1"));
    expect(firebaseSignOut).toHaveBeenCalledWith(firebaseAuth);
    expect(firebaseSignIn).toHaveBeenCalledWith(firebaseAuth, "token-1");
  });

  it("re-synchronizes Firebase identity when the Clerk account changes", async () => {
    const view = render(
      <FirebaseAuthBridgeProvider>
        <BridgeState />
      </FirebaseAuthBridgeProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("bridge-state")).toHaveTextContent("authenticated:clerk-user-1"));

    clerkAuth.mockReturnValue({ isLoaded: true, userId: "clerk-user-2" });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: "token-2" }),
    });
    view.rerender(
      <FirebaseAuthBridgeProvider>
        <BridgeState />
      </FirebaseAuthBridgeProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("bridge-state")).toHaveTextContent("authenticated:clerk-user-2"));
    expect(firebaseSignOut).toHaveBeenCalled();
    expect(firebaseSignIn).toHaveBeenCalledWith(firebaseAuth, "token-2");
  });

  it("exposes a safe error state if the token endpoint fails", async () => {
    global.fetch.mockResolvedValue({ ok: false, json: async () => ({ error: "server detail" }) });

    render(
      <FirebaseAuthBridgeProvider>
        <BridgeState />
      </FirebaseAuthBridgeProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("bridge-state")).toHaveTextContent("error:none"));
    expect(firebaseSignOut).toHaveBeenCalled();
  });

  it("rejects a Firebase UID that does not match the Clerk user ID", async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ token: "wrong-user-token" }) });

    render(
      <FirebaseAuthBridgeProvider>
        <BridgeState />
      </FirebaseAuthBridgeProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("bridge-state")).toHaveTextContent("error:none"));
    expect(firebaseSignOut).toHaveBeenCalled();
  });
});
