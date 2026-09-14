const SESSION_URL = "/api/session";

export async function setSelectedUserCookie(id) {
  await fetch(SESSION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
}

export async function clearSelectedUserCookie() {
  await fetch(SESSION_URL, { method: "DELETE" });
}

export async function readSelectedUserCookie() {
  const res = await fetch(SESSION_URL);
  const { id } = await res.json();
  return id;
}
