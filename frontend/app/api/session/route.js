import { NextResponse } from "next/server";

const COOKIE_NAME = "selected_user";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export async function GET(request) {
  const id = request.cookies.get(COOKIE_NAME)?.value ?? null;
  return NextResponse.json({ id });
}

export async function POST(request) {
  const { id } = await request.json();
  const res = NextResponse.json({ id });
  res.cookies.set(COOKIE_NAME, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
