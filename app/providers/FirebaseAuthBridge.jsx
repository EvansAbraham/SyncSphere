"use client";

import { useAuth } from "@clerk/nextjs";
import { signInWithCustomToken, signOut } from "firebase/auth";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { auth } from "../../config/firebaseAuth";

const FirebaseAuthBridgeContext = createContext({
  status: "loading",
  firebaseUid: null,
  error: null,
});

let syncQueue = Promise.resolve();
let syncGeneration = 0;

function enqueueSync(task) {
  const next = syncQueue.then(task, task);
  syncQueue = next.catch(() => undefined);
  return next;
}

export function FirebaseAuthBridgeProvider({ children }) {
  const { isLoaded, userId } = useAuth();
  const generationRef = useRef(0);
  const [state, setState] = useState({
    status: "loading",
    firebaseUid: null,
    error: null,
  });

  useEffect(() => {
    if (!isLoaded) {
      setState({ status: "loading", firebaseUid: null, error: null });
      return;
    }

    const generation = ++syncGeneration;
    generationRef.current = generation;
    let cancelled = false;
    const controller = new AbortController();

    const isCurrent = () => !cancelled && generationRef.current === generation;

    setState({
      status: "loading",
      firebaseUid: null,
      error: null,
    });

    enqueueSync(async () => {
      if (!isCurrent()) return;

      try {
        if (!userId) {
          await signOut(auth);
          if (isCurrent()) {
            setState({ status: "signed-out", firebaseUid: null, error: null });
          }
          return;
        }

        if (auth.currentUser?.uid !== userId) {
          await signOut(auth);
        }
        if (!isCurrent()) return;

        const response = await fetch("/api/auth/firebase-token", {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Firebase identity exchange failed.");
        }

        const payload = await response.json();
        if (!payload?.token) {
          throw new Error("Firebase identity exchange returned no token.");
        }
        if (!isCurrent()) return;

        const credential = await signInWithCustomToken(auth, payload.token);
        if (credential.user.uid !== userId) {
          await signOut(auth);
          throw new Error("Firebase identity did not match the Clerk session.");
        }

        if (isCurrent()) {
          setState({ status: "authenticated", firebaseUid: credential.user.uid, error: null });
        } else if (auth.currentUser?.uid === userId) {
          await signOut(auth);
        }
      } catch (error) {
        if (isCurrent() && error?.name !== "AbortError") {
          await signOut(auth).catch(() => undefined);
          setState({
            status: "error",
            firebaseUid: null,
            error: "Unable to synchronize Firebase authentication.",
          });
        }
      }
    });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [isLoaded, userId]);

  return (
    <FirebaseAuthBridgeContext.Provider value={state}>
      {children}
    </FirebaseAuthBridgeContext.Provider>
  );
}

export function useFirebaseAuthBridge() {
  return useContext(FirebaseAuthBridgeContext);
}
