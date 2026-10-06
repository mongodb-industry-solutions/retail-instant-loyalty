import fastifyPlugin from "fastify-plugin";
import fastifyMongo from "@fastify/mongodb";

/**
 * @param {FastifyInstance} fastify
 * @param {Object} options
 */

const mongodb_URI = process.env.MONGODB_URI;

async function dbConnector(fastify) {
  if (mongodb_URI) {
    try {
      await fastify.register(fastifyMongo, {
        forceClose: true,
        url: mongodb_URI,
        database: process.env.DATABASE_NAME,
      });
    } catch (err) {
      fastify.log.error(err);
      console.log("Cannot connect to MongoDb", err);
    }
  }
}

export default fastifyPlugin(dbConnector);
