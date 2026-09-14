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

export function fetchCustomer(id) {
  return request(`/customers/${id}`);
}

export function fetchProducts() {
  return request("/products");
}

export function fetchLoyaltyConfig() {
  return request("/loyalty-config");
}

// Accepts any subset of the config — { rewardDetails }, { campaign }, or both.
// The route merges the given keys into the stored document.
export function updateLoyaltyConfig(patch) {
  return request("/loyalty-config", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
}

export function fetchRedeemCandidates({ customerId, exclude = [] } = {}) {
  const qs = new URLSearchParams();
  if (customerId) qs.set("customerId", customerId);
  if (exclude.length) qs.set("exclude", exclude.join(","));
  const query = qs.size ? `?${qs}` : "";
  return request(`/redeem/candidates${query}`);
}

export function confirmRedeemRequest(body) {
  console.log("Confirm redeem request body:", body);

  return request("/redeem", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function fetchOrders(customerId) {
  const query = customerId
    ? `?customerId=${encodeURIComponent(customerId)}`
    : "";
  return request(`/orders${query}`);
}

export function fetchOrder(id) {
  return request(`/orders/${id}`);
}

export function createOrder(order) {
  return request("/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
}
