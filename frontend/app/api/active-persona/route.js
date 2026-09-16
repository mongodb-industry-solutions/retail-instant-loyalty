import { NextResponse } from "next/server";

// The persona this browser is acting as, kept in a cookie so middleware.js can
// gate routes before any JS runs. Unrelated to the backend session, which is
// /api/sessions/*.
const COOKIE_NAME = "active_persona";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};

export async function GET(request) {
  const id = request.cookies.get(COOKIE_NAME)?.value ?? null;
  return NextResponse.json({ id });
}

export async function POST(request) {
  const { id } = await request.json();
  const res = NextResponse.json({ id });
  res.cookies.set(COOKIE_NAME, id, COOKIE_OPTIONS);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
