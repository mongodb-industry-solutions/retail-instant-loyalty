import { API_URL } from "@/lib/helper";

const BACKEND_URL = API_URL;

export async function GET(request, { params }) {
  const { id: orderId } = await params;
  const customerId = request.nextUrl.searchParams.get("customerId") ?? "";

  if (!BACKEND_URL) {
    return new Response(JSON.stringify({ error: "API_URL is not set" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const backendRes = await fetch(
    `${BACKEND_URL}/orders/${orderId}/orderstatus`,
    {
      headers: { "x-customer-id": customerId },
      cache: "no-store",
      // Propagates a browser disconnect upstream so the backend closes its
      // change stream instead of leaking it.
      signal: request.signal,
    },
  );

  if (!backendRes.ok || !backendRes.body) {
    return new Response(await backendRes.text(), {
      status: backendRes.status,
    });
  }

  return new Response(backendRes.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
