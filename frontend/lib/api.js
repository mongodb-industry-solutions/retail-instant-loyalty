const BASE_URL = "/api";

async function request(path, options) {
  const res = await fetch(`${BASE_URL}${path}`, options);

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request to ${path} failed (${res.status})`);
  }

  return res.json();
}

export function fetchCustomers() {
  return request("/customers");
}
