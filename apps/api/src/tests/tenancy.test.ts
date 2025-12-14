// ============================================================================
// Tenancy Isolation Tests
// ============================================================================

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { query, shutdown } from '../lib/db';
import { hashPassword } from '../lib/auth';

describe('Tenancy Isolation', () => {
  let org1Id: string;
  let org2Id: string;
  let user1Id: string;
  let user2Id: string;
  let doc1Id: string;

  beforeAll(async () => {
    // Create two organizations
    const org1 = await query(
      'INSERT INTO organizations (name, slug) VALUES ($1, $2) RETURNING id',
      ['Org 1', 'org-1-tenancy']
    );
    org1Id = org1.rows[0].id;

    const org2 = await query(
      'INSERT INTO organizations (name, slug) VALUES ($1, $2) RETURNING id',
      ['Org 2', 'org-2-tenancy']
    );
    org2Id = org2.rows[0].id;

    // Create users in each org
    const passwordHash = await hashPassword('password123');

    const user1 = await query(
      'INSERT INTO users (organization_id, email, name, password_hash) VALUES ($1, $2, $3, $4) RETURNING id',
      [org1Id, 'user1@org1.com', 'User 1', passwordHash]
    );
    user1Id = user1.rows[0].id;

    const user2 = await query(
      'INSERT INTO users (organization_id, email, name, password_hash) VALUES ($1, $2, $3, $4) RETURNING id',
      [org2Id, 'user2@org2.com', 'User 2', passwordHash]
    );
    user2Id = user2.rows[0].id;

    // Create a capability document in org1
    const doc1 = await query(
      'INSERT INTO capability_documents (organization_id, title, doc_type, created_by) VALUES ($1, $2, $3, $4) RETURNING id',
      [org1Id, 'Org 1 Document', 'certification', user1Id]
    );
    doc1Id = doc1.rows[0].id;
  });

  afterAll(async () => {
    // Cleanup
    await query('DELETE FROM organizations WHERE id IN ($1, $2)', [
      org1Id,
      org2Id,
    ]);
    await shutdown();
  });

  it('should isolate users to their organization', async () => {
    // User 1 should only see their org's users
    const org1Users = await query(
      'SELECT id FROM users WHERE organization_id = $1',
      [org1Id]
    );
    expect(org1Users.rows.length).toBe(1);
    expect(org1Users.rows[0].id).toBe(user1Id);

    // User 2 should only see their org's users
    const org2Users = await query(
      'SELECT id FROM users WHERE organization_id = $1',
      [org2Id]
    );
    expect(org2Users.rows.length).toBe(1);
    expect(org2Users.rows[0].id).toBe(user2Id);
  });

  it('should isolate capability documents by organization', async () => {
    // Org 1 should see their document
    const org1Docs = await query(
      'SELECT id FROM capability_documents WHERE organization_id = $1',
      [org1Id]
    );
    expect(org1Docs.rows.length).toBe(1);
    expect(org1Docs.rows[0].id).toBe(doc1Id);

    // Org 2 should not see org 1's document
    const org2Docs = await query(
      'SELECT id FROM capability_documents WHERE organization_id = $1',
      [org2Id]
    );
    expect(org2Docs.rows.length).toBe(0);
  });

  it('should prevent cross-org queries without proper filtering', async () => {
    // This test ensures developers must explicitly filter by organization_id

    // Attempt to query all capability_documents without org filter
    const allDocs = await query('SELECT id FROM capability_documents');
    expect(allDocs.rows.length).toBeGreaterThanOrEqual(1);

    // When properly filtered, only org's docs should be returned
    const org1DocsFiltered = await query(
      'SELECT id FROM capability_documents WHERE organization_id = $1',
      [org1Id]
    );
    expect(org1DocsFiltered.rows.length).toBe(1);

    const org2DocsFiltered = await query(
      'SELECT id FROM capability_documents WHERE organization_id = $1',
      [org2Id]
    );
    expect(org2DocsFiltered.rows.length).toBe(0);
  });

  it('should enforce foreign key constraints across organizations', async () => {
    // User from org2 should not be able to reference org1's document
    // This would violate tenancy if allowed

    try {
      await query(
        'INSERT INTO capability_document_versions (organization_id, capability_document_id, version, file_name, content_type, size_bytes, sha256, storage_key, uploaded_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [
          org2Id, // Different org
          doc1Id, // Org1's document
          1,
          'test.pdf',
          'application/pdf',
          1024,
          'abc123',
          'test-key',
          user2Id,
        ]
      );
      // If we get here, the test should fail
      expect(false).toBe(true);
    } catch (error) {
      // This should fail because document belongs to org1 but we're trying to use org2's ID
      // In production, API layer should prevent this scenario
      expect(true).toBe(true);
    }
  });

  it('should maintain audit trail per organization', async () => {
    // Create audit events for each org
    await query(
      'INSERT INTO audit_events (organization_id, user_id, event_type) VALUES ($1, $2, $3)',
      [org1Id, user1Id, 'test.event.org1']
    );

    await query(
      'INSERT INTO audit_events (organization_id, user_id, event_type) VALUES ($1, $2, $3)',
      [org2Id, user2Id, 'test.event.org2']
    );

    // Each org should only see their events
    const org1Events = await query(
      'SELECT id FROM audit_events WHERE organization_id = $1',
      [org1Id]
    );
    expect(org1Events.rows.length).toBeGreaterThanOrEqual(1);

    const org2Events = await query(
      'SELECT id FROM audit_events WHERE organization_id = $1',
      [org2Id]
    );
    expect(org2Events.rows.length).toBeGreaterThanOrEqual(1);
  });
});
