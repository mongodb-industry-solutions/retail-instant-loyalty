// There is no session until a persona is actually claimed. Listing the
// selectable personas (GET /sessions) happens without one; the id is created
// at selection time and passed to /sessions/start, which uses it to mark the
// customer active and populate the other collections.
const STORAGE_KEY = "leafy_session_id";

// Null until a persona has been claimed. Never mints one as a side effect.
export function getSessionId() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(STORAGE_KEY);
}

export function createSessionId() {
  if (typeof window === "undefined") return null;
  const id = crypto.randomUUID();
  window.sessionStorage.setItem(STORAGE_KEY, id);
  return id;
}

export function clearSessionId() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}
