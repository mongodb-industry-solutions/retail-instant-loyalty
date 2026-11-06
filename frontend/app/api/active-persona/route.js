import { NextResponse } from "next/server";

// The persona this browser is acting as, kept in a cookie so middleware.js can
// gate routes before any JS runs. Unrelated to the backend session, which is
// /api/sessions/*.
const COOKIE_NAME = "active_persona";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};

// Browsers drop Secure cookies over plain HTTP (e.g. in-cluster http://<service>), so match the real protocol.
function isHttps(request) {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0].trim() === "https";
  return request.nextUrl.protocol === "https:";
}

export async function GET(request) {
  const id = request.cookies.get(COOKIE_NAME)?.value ?? null;
  return NextResponse.json({ id });
}

export async function POST(request) {
  const { id } = await request.json();
  const res = NextResponse.json({ id });
  res.cookies.set(COOKIE_NAME, id, { ...COOKIE_OPTIONS, secure: isHttps(request) });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}