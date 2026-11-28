import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";

const ADMIN_APP_NAME = "syncsphere-admin";

function getAdminCredentials() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin configuration is incomplete. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY.",
    );
  }

  const clientProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!clientProjectId || clientProjectId !== projectId) {
    throw new Error(
      "Firebase Client and Admin project IDs must match. Check NEXT_PUBLIC_FIREBASE_PROJECT_ID and FIREBASE_ADMIN_PROJECT_ID.",
    );
  }

  return { projectId, clientEmail, privateKey };
}

/**
 * Lazily initialize and reuse the named Firebase Admin app.
 * This module is server-only and intentionally does not initialize Firestore.
 */
export function getFirebaseAdminApp() {
  const { projectId, clientEmail, privateKey } = getAdminCredentials();
  const existingApp = getApps().find((app) => app.name === ADMIN_APP_NAME);

  if (existingApp) {
    if (existingApp.options.projectId !== projectId) {
      throw new Error(
        "The existing Firebase Admin app is configured for a different project.",
      );
    }

    return existingApp;
  }

  return initializeApp(
    {
      credential: cert({ projectId, clientEmail, privateKey }),
      projectId,
    },
    ADMIN_APP_NAME,
  );
}
