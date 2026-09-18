import Fastify from "fastify";
import cors from "@fastify/cors"
import customersRoutes from './routes/customers.js'
import sessionsRoutes from './routes/sessions.js'
import ordersRoutes from './routes/orders.js'
import dbConnector from "./DB/db-connector.js";
import redeemRoutes from "./routes/redeem.js";
import loyaltyConfigurationRoutes from "./routes/loyaltyConfiguration.js";
import productsRoutes from "./routes/products.js";


const app = Fastify({ logger: true });

app.get('/', async (request, response) => {
    return {Hello: 'World'}
})

const port = Number(process.env.PORT || 4000);

await app.register(dbConnector);

await app.register(sessionsRoutes);
await app.register(customersRoutes);
await app.register(ordersRoutes);
await app.register(redeemRoutes);
await app.register(loyaltyConfigurationRoutes);
await app.register(productsRoutes);

try {
    await app.listen({port, host: "0.0.0.0"});
} catch(err) {
    app.log.error(err);
    process.exit(1)
}