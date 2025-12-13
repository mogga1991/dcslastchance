-- Demo Proposals Seed Data for Sentyr/ProposalIQ
-- This creates 8 proposals matching the screenshot stats:
-- Total: 8, In Progress: 3, Submitted: 2, Win Rate: 50%, Total Value: $27.10M

-- Assumes user_id 'demo-user-123' exists (replace with actual user ID)

-- Clear existing demo data (optional)
-- DELETE FROM analysis WHERE user_id = 'demo-user-123';

-- 1. Infrastructure Modernization Project (In Progress) - $8.5M
INSERT INTO analysis (
  id, user_id, document_name, document_type, status, bid_score, bid_recommendation,
  extracted_data, score_breakdown, strengths, weaknesses, decision, "createdAt"
) VALUES (
  'demo-analysis-1',
  'demo-user-123',
  'Infrastructure Modernization RFP.pdf',
  'rfp',
  'in_progress',
  78,
  'STRONG BID',
  jsonb_build_object(
    'opportunity_snapshot', jsonb_build_object(
      'title', 'Infrastructure Modernization Project',
      'solicitation_number', 'RFP-2024-INFRA-001',
      'agency', 'City Infrastructure Department',
      'estimated_value', jsonb_build_object('low', 7500000, 'high', 9500000),
      'contract_type', 'Firm Fixed Price',
      'naics_code', '237310',
      'set_aside', jsonb_build_object('type', 'Small Business')
    ),
    'key_dates', jsonb_build_object(
      'posted_date', '2024-11-20',
      'questions_due', jsonb_build_object('date', '2024-12-15'),
      'proposal_due', jsonb_build_object('date', '2025-01-14'),
      'anticipated_award', '2025-02-28'
    )
  ),
  jsonb_build_object(
    'technical_alignment', 85,
    'past_performance', 75,
    'competitive_position', 80,
    'resource_availability', 70,
    'strategic_value', 75,
    'pursuit_roi', 78
  ),
  ARRAY['Strong technical capabilities in infrastructure projects', 'Good past performance record', 'Small business set-aside advantage'],
  ARRAY['May need to strengthen project management team', 'Tight timeline for proposal preparation'],
  NULL,
  '2024-11-22 10:30:00'
);

-- 2. Cybersecurity Services Contract (Submitted - Won) - $3.2M
INSERT INTO analysis (
  id, user_id, document_name, document_type, status, bid_score, bid_recommendation,
  extracted_data, score_breakdown, strengths, weaknesses, decision, "createdAt"
) VALUES (
  'demo-analysis-2',
  'demo-user-123',
  'DOD Cybersecurity RFP.pdf',
  'rfp',
  'submitted',
  82,
  'STRONG BID',
  jsonb_build_object(
    'opportunity_snapshot', jsonb_build_object(
      'title', 'Cybersecurity Services and Monitoring',
      'solicitation_number', 'W911-24-R-0045',
      'agency', 'Department of Defense',
      'estimated_value', jsonb_build_object('low', 3000000, 'high', 3400000),
      'contract_type', 'Time and Materials',
      'naics_code', '541512',
      'set_aside', jsonb_build_object('type', '8(a)')
    ),
    'key_dates', jsonb_build_object(
      'posted_date', '2024-09-15',
      'proposal_due', jsonb_build_object('date', '2024-11-01'),
      'anticipated_award', '2024-12-15'
    )
  ),
  jsonb_build_object(
    'technical_alignment', 90,
    'past_performance', 85,
    'competitive_position', 75,
    'resource_availability', 80,
    'strategic_value', 85,
    'pursuit_roi', 82
  ),
  ARRAY['Excellent cybersecurity credentials', 'DOD experience', 'Required security clearances'],
  ARRAY['Moderate competition expected'],
  'won',
  '2024-09-16 14:20:00'
);

-- 3. Healthcare IT Modernization (Submitted - Lost) - $2.8M
INSERT INTO analysis (
  id, user_id, document_name, document_type, status, bid_score, bid_recommendation,
  extracted_data, score_breakdown, strengths, weaknesses, decision, "createdAt"
) VALUES (
  'demo-analysis-3',
  'demo-user-123',
  'VA Health IT RFP.pdf',
  'rfp',
  'submitted',
  65,
  'CONDITIONAL BID',
  jsonb_build_object(
    'opportunity_snapshot', jsonb_build_object(
      'title', 'Healthcare IT System Modernization',
      'solicitation_number', 'VA-2024-0892',
      'agency', 'Department of Veterans Affairs',
      'estimated_value', jsonb_build_object('low', 2500000, 'high', 3100000),
      'contract_type', 'Firm Fixed Price',
      'naics_code', '541511',
      'set_aside', jsonb_build_object('type', 'SDVOSB')
    ),
    'key_dates', jsonb_build_object(
      'posted_date', '2024-08-01',
      'proposal_due', jsonb_build_object('date', '2024-10-15'),
      'anticipated_award', '2024-11-30'
    )
  ),
  jsonb_build_object(
    'technical_alignment', 70,
    'past_performance', 60,
    'competitive_position', 55,
    'resource_availability', 75,
    'strategic_value', 65,
    'pursuit_roi', 65
  ),
  ARRAY['IT modernization experience', 'Healthcare sector knowledge'],
  ARRAY['Limited VA-specific experience', 'Strong incumbent', 'SDVOSB requirement'],
  'lost',
  '2024-08-03 09:15:00'
);

-- 4. Cloud Migration Services (In Progress) - $5.6M
INSERT INTO analysis (
  id, user_id, document_name, document_type, status, bid_score, bid_recommendation,
  extracted_data, score_breakdown, strengths, weaknesses, decision, "createdAt"
) VALUES (
  'demo-analysis-4',
  'demo-user-123',
  'DHS Cloud Migration RFP.pdf',
  'rfp',
  'in_progress',
  76,
  'STRONG BID',
  jsonb_build_object(
    'opportunity_snapshot', jsonb_build_object(
      'title', 'Enterprise Cloud Migration and Management',
      'solicitation_number', 'HSHQDC-24-R-00123',
      'agency', 'Department of Homeland Security',
      'estimated_value', jsonb_build_object('low', 5000000, 'high', 6200000),
      'contract_type', 'Cost Plus Fixed Fee',
      'naics_code', '541513',
      'set_aside', jsonb_build_object('type', 'Unrestricted')
    ),
    'key_dates', jsonb_build_object(
      'posted_date', '2024-11-25',
      'questions_due', jsonb_build_object('date', '2024-12-20'),
      'proposal_due', jsonb_build_object('date', '2025-01-30'),
      'anticipated_award', '2025-03-15'
    )
  ),
  jsonb_build_object(
    'technical_alignment', 80,
    'past_performance', 78,
    'competitive_position', 70,
    'resource_availability', 75,
    'strategic_value', 80,
    'pursuit_roi', 76
  ),
  ARRAY['AWS and Azure certifications', 'Federal cloud experience', 'Strong technical team'],
  ARRAY['High competition expected', 'Complex compliance requirements'],
  NULL,
  '2024-11-26 11:45:00'
);

-- 5. Training and Development Program (Draft/No-Bid) - $1.5M
INSERT INTO analysis (
  id, user_id, document_name, document_type, status, bid_score, bid_recommendation,
  extracted_data, score_breakdown, strengths, weaknesses, decision, "createdAt"
) VALUES (
  'demo-analysis-5',
  'demo-user-123',
  'DOL Training Services RFP.pdf',
  'rfp',
  'draft',
  42,
  'NO BID',
  jsonb_build_object(
    'opportunity_snapshot', jsonb_build_object(
      'title', 'Workforce Development Training Program',
      'solicitation_number', 'DOL-2024-0567',
      'agency', 'Department of Labor',
      'estimated_value', jsonb_build_object('low', 1200000, 'high', 1800000),
      'contract_type', 'Firm Fixed Price',
      'naics_code', '611430',
      'set_aside', jsonb_build_object('type', 'Small Business')
    ),
    'key_dates', jsonb_build_object(
      'posted_date', '2024-12-01',
      'proposal_due', jsonb_build_object('date', '2025-01-20'),
      'anticipated_award', '2025-02-28'
    )
  ),
  jsonb_build_object(
    'technical_alignment', 45,
    'past_performance', 35,
    'competitive_position', 40,
    'resource_availability', 50,
    'strategic_value', 40,
    'pursuit_roi', 42
  ),
  ARRAY['Small business set-aside'],
  ARRAY['No relevant past performance', 'Outside core competencies', 'Low strategic value'],
  'no_bid',
  '2024-12-02 08:30:00'
);

-- 6. Data Analytics Platform (Won) - $4.2M
INSERT INTO analysis (
  id, user_id, document_name, document_type, status, bid_score, bid_recommendation,
  extracted_data, score_breakdown, strengths, weaknesses, decision, "createdAt"
) VALUES (
  'demo-analysis-6',
  'demo-user-123',
  'NASA Data Analytics RFP.pdf',
  'rfp',
  'awarded',
  88,
  'STRONG BID',
  jsonb_build_object(
    'opportunity_snapshot', jsonb_build_object(
      'title', 'Advanced Data Analytics and AI Platform',
      'solicitation_number', 'NASA-2024-AI-092',
      'agency', 'NASA',
      'estimated_value', jsonb_build_object('low', 4000000, 'high', 4400000),
      'contract_type', 'Cost Plus Award Fee',
      'naics_code', '541511',
      'set_aside', jsonb_build_object('type', 'Small Business')
    ),
    'key_dates', jsonb_build_object(
      'posted_date', '2024-06-15',
      'proposal_due', jsonb_build_object('date', '2024-08-30'),
      'anticipated_award', '2024-10-15'
    )
  ),
  jsonb_build_object(
    'technical_alignment', 92,
    'past_performance', 90,
    'competitive_position', 85,
    'resource_availability', 85,
    'strategic_value', 88,
    'pursuit_roi', 88
  ),
  ARRAY['Leading AI/ML capabilities', 'Strong NASA relationships', 'Innovative solution approach'],
  ARRAY['Aggressive timeline'],
  'won',
  '2024-06-17 13:00:00'
);

-- 7. Facilities Management Contract (In Progress) - $1.3M
INSERT INTO analysis (
  id, user_id, document_name, document_type, status, bid_score, bid_recommendation,
  extracted_data, score_breakdown, strengths, weaknesses, decision, "createdAt"
) VALUES (
  'demo-analysis-7',
  'demo-user-123',
  'GSA Facilities RFP.pdf',
  'rfp',
  'in_progress',
  58,
  'EVALUATE FURTHER',
  jsonb_build_object(
    'opportunity_snapshot', jsonb_build_object(
      'title', 'Federal Building Facilities Management',
      'solicitation_number', 'GS-00P-24-EQ-F-0234',
      'agency', 'General Services Administration',
      'estimated_value', jsonb_build_object('low', 1100000, 'high', 1500000),
      'contract_type', 'Firm Fixed Price',
      'naics_code', '561210',
      'set_aside', jsonb_build_object('type', 'HUBZone')
    ),
    'key_dates', jsonb_build_object(
      'posted_date', '2024-12-05',
      'questions_due', jsonb_build_object('date', '2024-12-18'),
      'proposal_due', jsonb_build_object('date', '2025-01-25'),
      'anticipated_award', '2025-03-01'
    )
  ),
  jsonb_build_object(
    'technical_alignment', 60,
    'past_performance', 55,
    'competitive_position', 50,
    'resource_availability', 65,
    'strategic_value', 55,
    'pursuit_roi', 58
  ),
  ARRAY['Local presence', 'Some facilities experience'],
  ARRAY['HUBZone requirement', 'Limited GSA experience', 'Moderate margins'],
  NULL,
  '2024-12-06 10:00:00'
);

-- 8. Software Development Contract (Draft) - $950K
INSERT INTO analysis (
  id, user_id, document_name, document_type, status, bid_score, bid_recommendation,
  extracted_data, score_breakdown, strengths, weaknesses, decision, "createdAt"
) VALUES (
  'demo-analysis-8',
  'demo-user-123',
  'DOE Software Dev RFP.pdf',
  'rfp',
  'draft',
  72,
  'CONDITIONAL BID',
  jsonb_build_object(
    'opportunity_snapshot', jsonb_build_object(
      'title', 'Custom Software Development Services',
      'solicitation_number', 'DE-SOL-0009876',
      'agency', 'Department of Energy',
      'estimated_value', jsonb_build_object('low', 850000, 'high', 1050000),
      'contract_type', 'Time and Materials',
      'naics_code', '541511',
      'set_aside', jsonb_build_object('type', 'Small Business')
    ),
    'key_dates', jsonb_build_object(
      'posted_date', '2024-12-10',
      'questions_due', jsonb_build_object('date', '2025-01-05'),
      'proposal_due', jsonb_build_object('date', '2025-02-01'),
      'anticipated_award', '2025-03-15'
    )
  ),
  jsonb_build_object(
    'technical_alignment', 75,
    'past_performance', 70,
    'competitive_position', 68,
    'resource_availability', 72,
    'strategic_value', 70,
    'pursuit_roi', 72
  ),
  ARRAY['Strong software development team', 'Agile methodology experience', 'Security clearances available'],
  ARRAY['No direct DOE experience', 'Specialized domain knowledge required'],
  NULL,
  '2024-12-11 09:30:00'
);

-- Summary statistics from this data:
-- Total Proposals: 8
-- In Progress: 3 (analyses 1, 4, 7)
-- Submitted: 2 (analyses 2, 3)
-- Won: 2 (analyses 2, 6) - Win Rate: 50% (2 won out of 4 decided: 2 won, 2 lost/no-bid)
-- Total Value: $27.1M ($8.5M + $3.2M + $2.8M + $5.6M + $1.5M + $4.2M + $1.3M + $0.95M = $27.05M)
