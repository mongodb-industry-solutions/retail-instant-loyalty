import { createChangeStream } from "../lib/changeStream.js";

export default function changeStreamRoutes(app) {
  app.get("/change-streams/:collection", async (request, reply) => {
    const { collection } = request.params;
    const { field, value } = request.query;
    const validName = /^[a-zA-Z][a-zA-Z0-9_]*$/;

    if (!validName.test(collection) || !validName.test(field) || !value) {
      return reply.code(400).send({
        error: {
          code: "INVALID_CHANGE_STREAM_FILTER",
          message: "collection, field, and value are required",
        },
      });
    }

    const stream = createChangeStream(app, {
      collection,
      filter: { [`fullDocument.${field}`]: value },
    });

    reply.hijack();
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    reply.raw.write("retry: 3000\n\n");

    let closed = false;

    const cleanup = async () => {
      if (closed) return;
      closed = true;
      clearInterval(heartbeat);
      await stream.close().catch(() => {});
    };

    const heartbeat = setInterval(() => {
      if (!reply.raw.destroyed) reply.raw.write(": heartbeat\n\n");
    }, 15_000);

    request.raw.once("close", cleanup);

    try {
      reply.raw.write(
        `event: connected\ndata: ${JSON.stringify({ collection })}\n\n`,
      );

      for await (const change of stream) {
        if (reply.raw.destroyed) break;
        reply.raw.write(
          `event: changed\ndata: ${JSON.stringify({
            collection,
            operationType: change.operationType,
          })}\n\n`,
        );
      }
    } catch (err) {
      if (!closed) app.log.error(err, "Change stream failed");
    } finally {
      await cleanup();
      if (!reply.raw.destroyed) reply.raw.end();
    }
  });
}