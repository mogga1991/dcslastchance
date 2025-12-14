// ============================================================================
// Database Seed Script
// Creates 1 org + 7 users (one per role) for development
// ============================================================================

import { query, shutdown } from '../lib/db';
import { hashPassword } from '../lib/auth';
import { UserRole } from '@govcon-os/shared';

async function seed() {
  console.log('🌱 Seeding database...\n');

  try {
    // Create organization
    const orgResult = await query(
      `
      INSERT INTO organizations (name, slug, settings)
      VALUES ($1, $2, $3)
      ON CONFLICT (slug) DO NOTHING
      RETURNING id
      `,
      [
        'Acme Defense Solutions',
        'acme-defense',
        JSON.stringify({
          score_categories: [
            { id: 'technical_fit', name: 'Technical Fit', weight: 0.25 },
            { id: 'past_performance', name: 'Past Performance Relevance', weight: 0.25 },
            { id: 'compliance_readiness', name: 'Compliance Readiness', weight: 0.20 },
            { id: 'capacity', name: 'Capacity & Staffing', weight: 0.15 },
            { id: 'pricing_risk', name: 'Pricing & Margin Risk', weight: 0.15 },
          ],
          hard_gates: [
            { id: 'clearance', name: 'Facility Clearance Required' },
            { id: 'bonding', name: 'Bonding Capacity Sufficient' },
            { id: 'set_aside', name: 'Set-Aside Eligibility' },
            { id: 'mandatory_cert', name: 'Mandatory Certifications' },
            { id: 'timeline_feasible', name: 'Timeline Feasibility' },
            { id: 'geographic_coverage', name: 'Geographic Coverage' },
          ],
        }),
      ]
    );

    let orgId: string;

    if (orgResult.rows.length > 0) {
      orgId = orgResult.rows[0].id;
      console.log(`✅ Created organization: Acme Defense Solutions (${orgId})\n`);
    } else {
      // Org already exists, fetch it
      const existing = await query(
        'SELECT id FROM organizations WHERE slug = $1',
        ['acme-defense']
      );
      orgId = existing.rows[0].id;
      console.log(`ℹ️  Organization already exists: ${orgId}\n`);
    }

    // Create users - one for each role
    const users = [
      { name: 'Admin User', email: 'admin@acme-defense.com', role: UserRole.ADMIN },
      { name: 'Capture Manager', email: 'capture@acme-defense.com', role: UserRole.CAPTURE_MANAGER },
      { name: 'Proposal Manager', email: 'proposal@acme-defense.com', role: UserRole.PROPOSAL_MANAGER },
      { name: 'Technical Writer', email: 'technical@acme-defense.com', role: UserRole.TECHNICAL_WRITER },
      { name: 'Pricing Analyst', email: 'pricing@acme-defense.com', role: UserRole.PRICING_ANALYST },
      { name: 'Reviewer User', email: 'reviewer@acme-defense.com', role: UserRole.REVIEWER },
      { name: 'ReadOnly User', email: 'readonly@acme-defense.com', role: UserRole.READONLY },
    ];

    const password = 'Password123!'; // Dev password
    const passwordHash = await hashPassword(password);

    console.log('Creating users:');

    for (const userData of users) {
      // Create user
      const userResult = await query(
        `
        INSERT INTO users (organization_id, email, name, password_hash)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (organization_id, email) DO UPDATE
          SET name = EXCLUDED.name
        RETURNING id
        `,
        [orgId, userData.email, userData.name, passwordHash]
      );

      const userId = userResult.rows[0].id;

      // Assign role
      await query(
        `
        INSERT INTO user_roles (organization_id, user_id, role)
        VALUES ($1, $2, $3)
        ON CONFLICT (organization_id, user_id, role) DO NOTHING
        `,
        [orgId, userId, userData.role]
      );

      console.log(`  ✅ ${userData.name} (${userData.email}) - ${userData.role}`);
    }

    console.log('\n🎉 Seed completed successfully!\n');
    console.log('Login credentials for all users:');
    console.log('  Password: Password123!\n');
    console.log('Users:');
    users.forEach((u) => {
      console.log(`  - ${u.email} (${u.role})`);
    });
    console.log('');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await shutdown();
  }
}

seed();
