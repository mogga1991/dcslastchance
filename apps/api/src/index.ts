// ============================================================================
// GovCon OS API Server
// ============================================================================

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import { JWT_SECRET, JWTPayload } from './lib/auth';
import { ensureBucket } from './lib/storage';
import redis from './lib/redis';

// Routes
import authRoutes from './routes/auth';
import capabilityRoutes from './routes/capabilities';

const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Plugins
fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
});

fastify.register(helmet, {
  contentSecurityPolicy: false, // Disable for API
});

fastify.register(jwt, {
  secret: JWT_SECRET,
});

fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  redis,
});

fastify.register(multipart, {
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

// JWT Authentication decorator
fastify.decorate('authenticate', async function (request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
});

// Extend types
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: any;
  }
  interface FastifyRequest {
    user?: JWTPayload;
  }
}

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(capabilityRoutes, { prefix: '/api' });

// Startup
const start = async () => {
  try {
    // Ensure MinIO bucket exists
    await ensureBucket();

    const port = parseInt(process.env.PORT || '4000');
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });

    console.log(`
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║   🚀 GovCon OS API Server                                ║
    ║                                                           ║
    ║   Environment: ${process.env.NODE_ENV || 'development'}                           ║
    ║   Server: http://${host}:${port}                      ║
    ║   Health: http://${host}:${port}/health               ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
    `);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await fastify.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await fastify.close();
  process.exit(0);
});

start();
