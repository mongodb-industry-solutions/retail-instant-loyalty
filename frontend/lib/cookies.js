// Which persona the browser is acting as. Separate from the backend session
// (lib/session.js) — this cookie exists so middleware.js can gate routes
// before any JS runs.
const ACTIVE_PERSONA_URL = "/api/active-persona";

export async function setActivePersonaCookie(id) {
  await fetch(ACTIVE_PERSONA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
}

export async function clearActivePersonaCookie() {
  await fetch(ACTIVE_PERSONA_URL, { method: "DELETE" });
}

export async function readActivePersonaCookie() {
  const res = await fetch(ACTIVE_PERSONA_URL);
  const { id } = await res.json();
  return id;
}
