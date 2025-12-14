// ============================================================================
// Auth Routes
// ============================================================================

import { FastifyInstance } from 'fastify';
import { LoginSchema, CreateUserSchema } from '@govcon-os/shared';
import { query } from '../lib/db';
import { hashPassword, verifyPassword } from '../lib/auth';
import { writeAuditEvent, AuditEventTypes } from '../lib/audit';

export default async function authRoutes(fastify: FastifyInstance) {
  // Login
  fastify.post('/login', async (request, reply) => {
    const body = LoginSchema.parse(request.body);

    // Find user
    const result = await query(
      `
      SELECT u.id, u.organization_id, u.email, u.name, u.password_hash, u.is_active,
             COALESCE(
               json_agg(ur.role) FILTER (WHERE ur.role IS NOT NULL),
               '[]'
             ) as roles
      FROM users u
      LEFT JOIN user_roles ur ON ur.user_id = u.id
      WHERE u.email = $1
      GROUP BY u.id
      `,
      [body.email]
    );

    if (result.rows.length === 0) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return reply.status(403).send({ error: 'Account is inactive' });
    }

    // Verify password
    const isValid = await verifyPassword(body.password, user.password_hash);
    if (!isValid) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = fastify.jwt.sign({
      userId: user.id,
      organizationId: user.organization_id,
      email: user.email,
      roles: user.roles,
    });

    // Audit
    await writeAuditEvent({
      organizationId: user.organization_id,
      userId: user.id,
      eventType: AuditEventTypes.USER_LOGIN,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    return {
      token,
      user: {
        id: user.id,
        organizationId: user.organization_id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
    };
  });

  // Get current user (requires auth)
  fastify.get(
    '/me',
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const userId = request.user!.userId;

      const result = await query(
        `
        SELECT u.id, u.organization_id, u.email, u.name,
               COALESCE(
                 json_agg(ur.role) FILTER (WHERE ur.role IS NOT NULL),
                 '[]'
               ) as roles
        FROM users u
        LEFT JOIN user_roles ur ON ur.user_id = u.id
        WHERE u.id = $1
        GROUP BY u.id
        `,
        [userId]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({ error: 'User not found' });
      }

      return result.rows[0];
    }
  );
}
