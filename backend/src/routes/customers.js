import { sendError } from "../lib/orderEngine.js";
export default function customersRoutes(app) {
  const collectionName = "customers";
  const db = app.mongo.db;

  app.get("/customers/:customerId", async (request, reply) => {
    const customer = await db
      .collection(collectionName)
      .findOne({ customerId: request.params.customerId });
    if (!customer) {
      return sendError(reply, 404, "CUSTOMER_NOT_FOUND", "Customer not found");
    }
    return customer;
  });

  app.get("/customers/:customerId/changeEvent", async (request, reply) => {
    const { customerId } = request.params;

    const customer = await db
      .collection(collectionName)
      .findOne({ customerId });

    if (!customer) {
      return sendError(reply, 404, "CUSTOMER_NOT_FOUND", "Customer not found");
    }

    reply.hijack();

    const response = reply.raw;
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    response.flushHeaders?.();

    let closed = false;
    let heartbeat;

    const changeStream = db.collection(collectionName).watch(
      [
        {
          $match: {
            operationType: { $in: ["update", "replace"] },
            "fullDocument.customerId": customerId,
          },
        },
      ],
      { fullDocument: "updateLookup" },
    );

    const sendEvent = (eventName, data) => {
      if (closed || response.writableEnded) return;

      response.write(
        `event: ${eventName}\n` + `data: ${JSON.stringify(data)}\n\n`,
      );
    };

    const sendCustomer = (customerData) => {
      sendEvent("customer-updated", {
        customerId: customerData.customerId,
        loyaltyDetails: customerData.loyaltyDetails,
        profile: customerData.profile,
      });
    };

    // Initial snapshot
    //sendCustomer(customer);

    const closeStream = async () => {
      if (closed) return;

      closed = true;
      clearInterval(heartbeat);

      try {
        await changeStream.close();
      } catch (error) {
        app.log.error(error, "Failed to close customer change stream");
      }

      if (!response.writableEnded) {
        response.end();
      }
    };

    changeStream.on("change", (change) => {
      if (change.fullDocument) {
        sendCustomer(change.fullDocument);
      }
    });

    changeStream.on("error", async (error) => {
      app.log.error(error, "Customer change stream failed");
      await closeStream();
    });

    heartbeat = setInterval(() => {
      if (!closed && !response.writableEnded) {
        response.write(": keep-alive\n\n");
      }
    }, 30_000);

    // Clean up on any end of the connection — the request event alone misses
    // sockets that die without a clean close. closeStream is idempotent.
    request.raw.on("close", closeStream);
    request.raw.on("aborted", closeStream);
    response.on("close", closeStream);
    response.on("error", closeStream);
  });
}
