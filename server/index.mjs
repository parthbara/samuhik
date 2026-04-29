import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config.mjs';
import { authMiddleware } from './middleware/auth.mjs';
import { conversationsRoutes } from './routes/conversations.mjs';
import { webhookRoutes } from './routes/webhook.mjs';

const app = Fastify({
  logger: config.nodeEnv !== 'production'
    ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
    : true,
});

await app.register(cors, { origin: true });

// Unauthenticated routes
app.get('/health', async () => ({ ok: true, ts: Date.now(), env: config.nodeEnv }));

// All /api/* routes require a valid X-API-Key header
app.addHook('preHandler', async (request, reply) => {
  if (request.routeOptions?.url?.startsWith('/api/')) {
    await authMiddleware(request, reply);
  }
});

await app.register(conversationsRoutes, { prefix: '/api' });
await app.register(webhookRoutes, { prefix: '/webhook' });

app.setErrorHandler((error, request, reply) => {
  app.log.error(error);
  const status = error.statusCode ?? 500;
  reply.status(status).send({ error: error.message || 'Internal server error' });
});

try {
  await app.listen({ port: config.port, host: '0.0.0.0' });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
