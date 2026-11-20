import { createServer } from "node:http";
import { httpServerHandler } from "cloudflare:node";
import app from "./server.js";

/**
 * Punto de entrada para Cloudflare Workers.
 * Mapea la aplicación Express mediante el adaptador nativo httpServerHandler.
 */
const server = createServer(app);
const handler = httpServerHandler(server);

export default {
    async fetch(request, env, ctx) {
        // Garantizar que las variables de entorno y secrets de Cloudflare estén disponibles en process.env
        if (env && typeof env === 'object') {
            for (const [key, value] of Object.entries(env)) {
                if (typeof value === 'string') {
                    process.env[key] = value;
                }
            }
        }
        return handler.fetch(request, env, ctx);
    }
};
