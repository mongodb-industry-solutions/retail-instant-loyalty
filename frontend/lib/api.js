import { getSessionId, createSessionId, clearSessionId } from "./session";

const BASE_URL = "/api";

async function request(path, options = {}) {
  const sessionId = getSessionId();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      ...(sessionId ? { "x-session-id": sessionId } : {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    // The backend errors as { error: { code, message } }; the placeholder
    // routes still use a plain { error: "..." } string.
    const err = body?.error;
    const message =
      (typeof err === "string" ? err : err?.message) ??
      `Request to ${path} failed (${res.status})`;
    const error = new Error(message);
    error.code = typeof err === "object" ? err?.code : undefined;
    error.status = res.status;
    throw error;
  }

  const body = await res.json();
  // The backend wraps payloads as { data, meta }; placeholder routes return
  // the payload directly.
  return body?.data ?? body;
}

export async function getProductsWithSearch(query = "", filter = {}) {
  console.log("Get products wthen the search bar is used");
  const searchedProduct = await request(`/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, facets: filter }),
  });
  return searchedProduct;
}

export function fetchCustomers() {
  return request("/customers");
}

// Up to 4 personas not currently claimed by another demo session.
export async function fetchSessions() {
  const { customers } = await request("/sessions");
  return customers;
}

export async function fetchLoyaltyHistory({ customerId }) {
  return request("/loyaltyHistory", {
    headers: { "x-customer-id": customerId ?? "" },
  });
}

// Selecting a persona is what starts a session: mint the id here, then claim.
// The response carries the full customer document.
export async function startSession(selectedCustomerId) {
  createSessionId();
  try {
    const { customer } = await request("/sessions/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedCustomerId }),
    });
    return customer;
  } catch (err) {
    // Nothing was claimed, so leave no session behind — the next attempt
    // should start clean.
    clearSessionId();
    throw err;
  }
}

// Releases the claimed persona and ends the session.
export async function endSession() {
  try {
    return await request("/sessions/end", { method: "POST" });
  } finally {
    clearSessionId();
  }
}

export function fetchCustomer(id) {
  return request(`/customers/${id}`);
}

export function fetchProducts() {
  return request("/products");
}

export function fetchLoyaltyConfig() {
  return request("/loyalty-configuration");
}

// Accepts any subset of the config — { rewardDetails }, { campaign }, or both.
// The route merges the given keys into the stored document.
export function updateLoyaltyConfig(patch) {
  return request("/loyalty-configuration", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-session-id": getSessionId() ?? "",
    },
    body: JSON.stringify(patch),
  });
}

// Session-scoped — the backend derives the customer from x-session-id.
// excludeProducts is forwarded as-is to match the backend's own field name.
export function fetchRedeemCandidates({ excludeProducts = [] } = {}) {
  return request("/redeem/candidates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ excludeProducts }),
  });
}

export function confirmRedeemRequest(body) {
  return request("/redeem", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// Priced preview of an order — same engine as POST /orders, no writes.
export function fetchOrderOverview({ items, coinsToApply = 0 }) {
  return request("/orders/overview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, coinsToApply }),
  });
}

export async function fetchOrders({ page = 1, limit = 20, customerId } = {}) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  const query = qs.size ? `?${qs}` : "";
  const { orders } = await request(`/orders${query}`, {
    headers: {
      "x-customer-id": customerId ?? "",
    },
  });
  return orders;
}

// One order, scoped to the current session — proxies GET /orders/:orderId.
export function fetchOrder({ orderId, customerId }) {
  return request(`/orders/${orderId}`, {
    headers: { "x-customer-id": customerId ?? "" },
  });
}

export function createOrder(order) {
  return request("/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
}
