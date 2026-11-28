import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuth } from "firebase-admin/auth";
import { getFirebaseAdminApp } from "../../../../lib/firebase-admin/admin.js";

const TOKEN_RESPONSE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
};

function rejectRequest(status = 403) {
  return NextResponse.json(
    { error: "Request not allowed." },
    { status, headers: TOKEN_RESPONSE_HEADERS },
  );
}

function isSameOriginRequest(request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) return false;

  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);

    if (originUrl.origin !== requestUrl.origin || originUrl.host !== host) {
      return false;
    }

    const fetchSite = request.headers.get("sec-fetch-site");
    return !fetchSite || fetchSite === "same-origin";
  } catch {
    return false;
  }
}

export async function POST(request) {
  if (!isSameOriginRequest(request)) {
    return rejectRequest(403);
  }

  try {
    const { userId } = await auth();

    if (!userId) {
      return rejectRequest(401);
    }

    const firebaseAuth = getAuth(getFirebaseAdminApp());
    const token = await firebaseAuth.createCustomToken(userId);

    return NextResponse.json(
      { token },
      { status: 200, headers: TOKEN_RESPONSE_HEADERS },
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to establish Firebase authentication." },
      { status: 500, headers: TOKEN_RESPONSE_HEADERS },
    );
  }
}
