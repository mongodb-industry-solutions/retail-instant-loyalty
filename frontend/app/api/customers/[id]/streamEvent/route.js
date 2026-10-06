import { API_URL } from "@/lib/helper";

const BACKEND_URL = API_URL;

export async function GET(request, { params }) {
  const { id: customerId } = await params;

  if (!BACKEND_URL) {
    return new Response(JSON.stringify({ error: "API_URL is not set" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const backendRes = await fetch(
    `${BACKEND_URL}/customers/${customerId}/changeEvent`,
    // Without the signal, a browser disconnect leaves this request open, the
    // backend never sees "close", and its change stream leaks.
    { cache: "no-store", signal: request.signal },
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
