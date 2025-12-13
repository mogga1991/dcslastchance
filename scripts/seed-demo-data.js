const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function seedDemoData() {
  try {
    console.log('🌱 Starting demo data seed...\n');

    // Get or create a demo user
    let users = await sql`SELECT id, email, name FROM "user" LIMIT 1`;

    let userId;
    if (users.length === 0) {
      console.log('No users found. Creating demo user...');
      const newUser = await sql`
        INSERT INTO "user" (id, name, email, "emailVerified", role, analysis_credits, subscription_tier)
        VALUES (
          'demo-user-' || gen_random_uuid()::text,
          'Demo User',
          'demo@sentyr.com',
          true,
          'contractor',
          10,
          'pro'
        )
        RETURNING id, email, name
      `;
      userId = newUser[0].id;
      console.log(`✅ Created demo user: ${newUser[0].email} (${userId})\n`);
    } else {
      userId = users[0].id;
      console.log(`✅ Using existing user: ${users[0].email} (${userId})\n`);
    }

    // Clear existing demo analysis data for this user
    console.log('🧹 Clearing existing analysis data...');
    const deleted = await sql`DELETE FROM analysis WHERE user_id = ${userId}`;
    console.log(`   Removed ${deleted.length} existing analyses\n`);

    // Insert demo proposals
    console.log('📝 Inserting demo proposals...\n');

    // 1. Infrastructure Modernization Project (In Progress) - $8.5M
    await sql`
      INSERT INTO analysis (
        id, user_id, document_name, document_type, status, bid_score, bid_recommendation,
        extracted_data, score_breakdown, strengths, weaknesses, decision, "createdAt"
      ) VALUES (
        'demo-analysis-1',
        ${userId},
        'Infrastructure Modernization RFP.pdf',
        'rfp',
        'in_progress',
        78,
        'STRONG BID',
        ${JSON.stringify({
          opportunity_snapshot: {
            title: 'Infrastructure Modernization Project',
            solicitation_number: 'RFP-2024-INFRA-001',
            agency: 'City Infrastructure Department',
            estimated_value: { low: 7500000, high: 9500000 },
            contract_type: 'Firm Fixed Price',
            naics_code: '237310',
            set_aside: { type: 'Small Business' }
          },
          key_dates: {
            posted_date: '2024-11-20',
            questions_due: { date: '2024-12-15' },
            proposal_due: { date: '2025-01-14' },
            anticipated_award: '2025-02-28'
          }
        })},
        ${JSON.stringify({
          technical_alignment: 85,
          past_performance: 75,
          competitive_position: 80,
          resource_availability: 70,
          strategic_value: 75,
          pursuit_roi: 78
        })},
        ARRAY['Strong technical capabilities in infrastructure projects', 'Good past performance record', 'Small business set-aside advantage'],
        ARRAY['May need to strengthen project management team', 'Tight timeline for proposal preparation'],
        NULL,
        '2024-11-22 10:30:00'
      )
    `;
    console.log('   ✓ Infrastructure Modernization Project');

    // 2. Cybersecurity Services Contract (Submitted - Won) - $3.2M
    await sql`
      INSERT INTO analysis (
        id, user_id, document_name, document_type, status, bid_score, bid_recommendation,
        extracted_data, score_breakdown, strengths, weaknesses, decision, "createdAt"
      ) VALUES (
        'demo-analysis-2',
        ${userId},
        'DOD Cybersecurity RFP.pdf',
        'rfp',
        'submitted',
        82,
        'STRONG BID',
        ${JSON.stringify({
          opportunity_snapshot: {
            title: 'Cybersecurity Services and Monitoring',
            solicitation_number: 'W911-24-R-0045',
            agency: 'Department of Defense',
            estimated_value: { low: 3000000, high: 3400000 },
            contract_type: 'Time and Materials',
            naics_code: '541512',
            set_aside: { type: '8(a)' }
          },
          key_dates: {
            posted_date: '2024-09-15',
            proposal_due: { date: '2024-11-01' },
            anticipated_award: '2024-12-15'
          }
        })},
        ${JSON.stringify({
          technical_alignment: 90,
          past_performance: 85,
          competitive_position: 75,
          resource_availability: 80,
          strategic_value: 85,
          pursuit_roi: 82
        })},
        ARRAY['Excellent cybersecurity credentials', 'DOD experience', 'Required security clearances'],
        ARRAY['Moderate competition expected'],
        'won',
        '2024-09-16 14:20:00'
      )
    `;
    console.log('   ✓ Cybersecurity Services Contract');

    // 3. Healthcare IT Modernization (Submitted - Lost) - $2.8M
    await sql`
      INSERT INTO analysis (
        id, user_id, document_name, document_type, status, bid_score, bid_recommendation,
        extracted_data, score_breakdown, strengths, weaknesses, decision, "createdAt"
      ) VALUES (
        'demo-analysis-3',
        ${userId},
        'VA Health IT RFP.pdf',
        'rfp',
        'submitted',
        65,
        'CONDITIONAL BID',
        ${JSON.stringify({
          opportunity_snapshot: {
            title: 'Healthcare IT System Modernization',
            solicitation_number: 'VA-2024-0892',
            agency: 'Department of Veterans Affairs',
            estimated_value: { low: 2500000, high: 3100000 },
            contract_type: 'Firm Fixed Price',
            naics_code: '541511',
            set_aside: { type: 'SDVOSB' }
          },
          key_dates: {
            posted_date: '2024-08-01',
            proposal_due: { date: '2024-10-15' },
            anticipated_award: '2024-11-30'
          }
        })},
        ${JSON.stringify({
          technical_alignment: 70,
          past_performance: 60,
          competitive_position: 55,
          resource_availability: 75,
          strategic_value: 65,
          pursuit_roi: 65
        })},
        ARRAY['IT modernization experience', 'Healthcare sector knowledge'],
        ARRAY['Limited VA-specific experience', 'Strong incumbent', 'SDVOSB requirement'],
        'lost',
        '2024-08-03 09:15:00'
      )
    `;
    console.log('   ✓ Healthcare IT Modernization');

    // 4. Cloud Migration Services (In Progress) - $5.6M
    await sql`
      INSERT INTO analysis (
        id, user_id, document_name, document_type, status, bid_score, bid_recommendation,
        extracted_data, score_breakdown, strengths, weaknesses, decision, "createdAt"
      ) VALUES (
        'demo-analysis-4',
        ${userId},
        'DHS Cloud Migration RFP.pdf',
        'rfp',
        'in_progress',
        76,
        'STRONG BID',
        ${JSON.stringify({
          opportunity_snapshot: {
            title: 'Enterprise Cloud Migration and Management',
            solicitation_number: 'HSHQDC-24-R-00123',
            agency: 'Department of Homeland Security',
            estimated_value: { low: 5000000, high: 6200000 },
            contract_type: 'Cost Plus Fixed Fee',
            naics_code: '541513',
            set_aside: { type: 'Unrestricted' }
          },
          key_dates: {
            posted_date: '2024-11-25',
            questions_due: { date: '2024-12-20' },
            proposal_due: { date: '2025-01-30' },
            anticipated_award: '2025-03-15'
          }
        })},
        ${JSON.stringify({
          technical_alignment: 80,
          past_performance: 78,
          competitive_position: 70,
          resource_availability: 75,
          strategic_value: 80,
          pursuit_roi: 76
        })},
        ARRAY['AWS and Azure certifications', 'Federal cloud experience', 'Strong technical team'],
        ARRAY['High competition expected', 'Complex compliance requirements'],
        NULL,
        '2024-11-26 11:45:00'
      )
    `;
    console.log('   ✓ Cloud Migration Services');

    // 5. Training and Development Program (Draft/No-Bid) - $1.5M
    await sql`
      INSERT INTO analysis (
        id, user_id, document_name, document_type, status, bid_score, bid_recommendation,
        extracted_data, score_breakdown, strengths, weaknesses, decision, "createdAt"
      ) VALUES (
        'demo-analysis-5',
        ${userId},
        'DOL Training Services RFP.pdf',
        'rfp',
        'draft',
        42,
        'NO BID',
        ${JSON.stringify({
          opportunity_snapshot: {
            title: 'Workforce Development Training Program',
            solicitation_number: 'DOL-2024-0567',
            agency: 'Department of Labor',
            estimated_value: { low: 1200000, high: 1800000 },
            contract_type: 'Firm Fixed Price',
            naics_code: '611430',
            set_aside: { type: 'Small Business' }
          },
          key_dates: {
            posted_date: '2024-12-01',
            proposal_due: { date: '2025-01-20' },
            anticipated_award: '2025-02-28'
          }
        })},
        ${JSON.stringify({
          technical_alignment: 45,
          past_performance: 35,
          competitive_position: 40,
          resource_availability: 50,
          strategic_value: 40,
          pursuit_roi: 42
        })},
        ARRAY['Small business set-aside'],
        ARRAY['No relevant past performance', 'Outside core competencies', 'Low strategic value'],
        'no_bid',
        '2024-12-02 08:30:00'
      )
    `;
    console.log('   ✓ Training and Development Program');

    // 6. Data Analytics Platform (Won) - $4.2M
    await sql`
      INSERT INTO analysis (
        id, user_id, document_name, document_type, status, bid_score, bid_recommendation,
        extracted_data, score_breakdown, strengths, weaknesses, decision, "createdAt"
      ) VALUES (
        'demo-analysis-6',
        ${userId},
        'NASA Data Analytics RFP.pdf',
        'rfp',
        'awarded',
        88,
        'STRONG BID',
        ${JSON.stringify({
          opportunity_snapshot: {
            title: 'Advanced Data Analytics and AI Platform',
            solicitation_number: 'NASA-2024-AI-092',
            agency: 'NASA',
            estimated_value: { low: 4000000, high: 4400000 },
            contract_type: 'Cost Plus Award Fee',
            naics_code: '541511',
            set_aside: { type: 'Small Business' }
          },
          key_dates: {
            posted_date: '2024-06-15',
            proposal_due: { date: '2024-08-30' },
            anticipated_award: '2024-10-15'
          }
        })},
        ${JSON.stringify({
          technical_alignment: 92,
          past_performance: 90,
          competitive_position: 85,
          resource_availability: 85,
          strategic_value: 88,
          pursuit_roi: 88
        })},
        ARRAY['Leading AI/ML capabilities', 'Strong NASA relationships', 'Innovative solution approach'],
        ARRAY['Aggressive timeline'],
        'won',
        '2024-06-17 13:00:00'
      )
    `;
    console.log('   ✓ Data Analytics Platform');

    // 7. Facilities Management Contract (In Progress) - $1.3M
    await sql`
      INSERT INTO analysis (
        id, user_id, document_name, document_type, status, bid_score, bid_recommendation,
        extracted_data, score_breakdown, strengths, weaknesses, decision, "createdAt"
      ) VALUES (
        'demo-analysis-7',
        ${userId},
        'GSA Facilities RFP.pdf',
        'rfp',
        'in_progress',
        58,
        'EVALUATE FURTHER',
        ${JSON.stringify({
          opportunity_snapshot: {
            title: 'Federal Building Facilities Management',
            solicitation_number: 'GS-00P-24-EQ-F-0234',
            agency: 'General Services Administration',
            estimated_value: { low: 1100000, high: 1500000 },
            contract_type: 'Firm Fixed Price',
            naics_code: '561210',
            set_aside: { type: 'HUBZone' }
          },
          key_dates: {
            posted_date: '2024-12-05',
            questions_due: { date: '2024-12-18' },
            proposal_due: { date: '2025-01-25' },
            anticipated_award: '2025-03-01'
          }
        })},
        ${JSON.stringify({
          technical_alignment: 60,
          past_performance: 55,
          competitive_position: 50,
          resource_availability: 65,
          strategic_value: 55,
          pursuit_roi: 58
        })},
        ARRAY['Local presence', 'Some facilities experience'],
        ARRAY['HUBZone requirement', 'Limited GSA experience', 'Moderate margins'],
        NULL,
        '2024-12-06 10:00:00'
      )
    `;
    console.log('   ✓ Facilities Management Contract');

    // 8. Software Development Contract (Draft) - $950K
    await sql`
      INSERT INTO analysis (
        id, user_id, document_name, document_type, status, bid_score, bid_recommendation,
        extracted_data, score_breakdown, strengths, weaknesses, decision, "createdAt"
      ) VALUES (
        'demo-analysis-8',
        ${userId},
        'DOE Software Dev RFP.pdf',
        'rfp',
        'draft',
        72,
        'CONDITIONAL BID',
        ${JSON.stringify({
          opportunity_snapshot: {
            title: 'Custom Software Development Services',
            solicitation_number: 'DE-SOL-0009876',
            agency: 'Department of Energy',
            estimated_value: { low: 850000, high: 1050000 },
            contract_type: 'Time and Materials',
            naics_code: '541511',
            set_aside: { type: 'Small Business' }
          },
          key_dates: {
            posted_date: '2024-12-10',
            questions_due: { date: '2025-01-05' },
            proposal_due: { date: '2025-02-01' },
            anticipated_award: '2025-03-15'
          }
        })},
        ${JSON.stringify({
          technical_alignment: 75,
          past_performance: 70,
          competitive_position: 68,
          resource_availability: 72,
          strategic_value: 70,
          pursuit_roi: 72
        })},
        ARRAY['Strong software development team', 'Agile methodology experience', 'Security clearances available'],
        ARRAY['No direct DOE experience', 'Specialized domain knowledge required'],
        NULL,
        '2024-12-11 09:30:00'
      )
    `;
    console.log('   ✓ Software Development Contract');

    console.log('\n📊 Verifying statistics...');

    // Verify counts
    const total = await sql`SELECT COUNT(*) as count FROM analysis WHERE user_id = ${userId}`;
    const inProgress = await sql`SELECT COUNT(*) as count FROM analysis WHERE user_id = ${userId} AND status = 'in_progress'`;
    const submitted = await sql`SELECT COUNT(*) as count FROM analysis WHERE user_id = ${userId} AND status = 'submitted'`;
    const won = await sql`SELECT COUNT(*) as count FROM analysis WHERE user_id = ${userId} AND decision = 'won'`;
    const decided = await sql`SELECT COUNT(*) as count FROM analysis WHERE user_id = ${userId} AND decision IS NOT NULL`;

    console.log(`   Total Proposals: ${total[0].count}`);
    console.log(`   In Progress: ${inProgress[0].count}`);
    console.log(`   Submitted: ${submitted[0].count}`);
    console.log(`   Won: ${won[0].count} of ${decided[0].count} decided`);
    console.log(`   Win Rate: ${decided[0].count > 0 ? Math.round((won[0].count / decided[0].count) * 100) : 0}%`);

    console.log('\n✅ Demo data seed complete!\n');
    console.log(`🔑 User ID: ${userId}`);
    console.log('📍 Navigate to /dashboard/proposals to see the demo data\n');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

seedDemoData();
