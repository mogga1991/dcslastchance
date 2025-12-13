-- Insert 20 demo GSA lease opportunities across the United States

INSERT INTO opportunities (
  notice_id, title, solicitation_number, department, sub_tier, office,
  posted_date, type, base_type, archive_type, archive_date,
  type_of_set_aside, type_of_set_aside_description, response_deadline,
  naics_code, classification_code, active, description, organization_type,
  office_zipcode, office_city, office_country_code, office_state,
  pop_city_code, pop_city_name, pop_state_code, pop_state_name,
  pop_zip, pop_country_code, pop_country_name, ui_link, source
) VALUES
-- 1. New York
('demo-001-gsa-lease-ny', 'Office Space Lease - Manhattan Financial District', 'GSA-NYC-2025-001',
 'General Services Administration', 'Public Buildings Service', 'GSA PBS Real Property Leasing',
 '2025-12-01', 'Solicitation', 'Solicitation', 'autocustom', '2026-03-17',
 'NONE', 'No Set aside used', '2026-02-15',
 '531120', 'X1AA', 'Yes', 'GSA seeks approximately 15,000 SF of office space in Lower Manhattan for Federal agency operations. Prime location near public transit.', 'OFFICE',
 '10004', 'New York', 'USA', 'NY',
 '36061', 'New York', 'NY', 'New York',
 '10004', 'USA', 'UNITED STATES', 'https://sam.gov/workspace/contract/opp/demo-001-gsa-lease-ny/view', 'gsa_leasing'),

-- 2. California
('demo-002-gsa-lease-ca', 'Federal Building Lease - San Francisco Bay Area', 'GSA-SF-2025-002',
 'General Services Administration', 'Public Buildings Service', 'GSA PBS Real Property Leasing',
 '2025-12-02', 'Solicitation', 'Solicitation', 'autocustom', '2026-03-02',
 'NONE', 'No Set aside used', '2026-01-30',
 '531120', 'X1AA', 'Yes', 'Lease for 25,000 SF government office building in downtown San Francisco. Must meet federal security standards.', 'OFFICE',
 '94102', 'San Francisco', 'USA', 'CA',
 '06075', 'San Francisco', 'CA', 'California',
 '94102', 'USA', 'UNITED STATES', 'https://sam.gov/workspace/contract/opp/demo-002-gsa-lease-ca/view', 'gsa_leasing'),

-- 3. Texas
('demo-003-gsa-lease-tx', 'GSA Office Space - Dallas Metro', 'GSA-DAL-2025-003',
 'General Services Administration', 'Public Buildings Service', 'GSA PBS Real Property Leasing',
 '2025-12-03', 'Solicitation', 'Solicitation', 'autocustom', '2026-03-31',
 'NONE', 'No Set aside used', '2026-03-01',
 '531120', 'X1AA', 'Yes', '20,000 SF office space required for federal operations in Dallas. Parking for 50 vehicles required.', 'OFFICE',
 '75201', 'Dallas', 'USA', 'TX',
 '48113', 'Dallas', 'TX', 'Texas',
 '75201', 'USA', 'UNITED STATES', 'https://sam.gov/workspace/contract/opp/demo-003-gsa-lease-tx/view', 'gsa_leasing'),

-- 4. Florida
('demo-004-gsa-lease-fl', 'Federal Office Lease - Miami', 'GSA-MIA-2025-004',
 'General Services Administration', 'Public Buildings Service', 'GSA PBS Real Property Leasing',
 '2025-12-04', 'Solicitation', 'Solicitation', 'autocustom', '2026-03-22',
 'NONE', 'No Set aside used', '2026-02-20',
 '531120', 'X1AA', 'Yes', 'GSA seeking 12,000 SF of modern office space in Miami for agency consolidation. Hurricane-rated building required.', 'OFFICE',
 '33130', 'Miami', 'USA', 'FL',
 '12086', 'Miami', 'FL', 'Florida',
 '33130', 'USA', 'UNITED STATES', 'https://sam.gov/workspace/contract/opp/demo-004-gsa-lease-fl/view', 'gsa_leasing'),

-- 5. Illinois
('demo-005-gsa-lease-il', 'Chicago Loop Office Space', 'GSA-CHI-2025-005',
 'General Services Administration', 'Public Buildings Service', 'GSA PBS Real Property Leasing',
 '2025-12-05', 'Solicitation', 'Solicitation', 'autocustom', '2026-02-25',
 'NONE', 'No Set aside used', '2026-01-25',
 '531120', 'X1AA', 'Yes', '30,000 SF premium office space in Chicago Loop for federal agency headquarters. Must include conference facilities.', 'OFFICE',
 '60604', 'Chicago', 'USA', 'IL',
 '17031', 'Chicago', 'IL', 'Illinois',
 '60604', 'USA', 'UNITED STATES', 'https://sam.gov/workspace/contract/opp/demo-005-gsa-lease-il/view', 'gsa_leasing'),

-- 6. Washington
('demo-006-gsa-lease-wa', 'Seattle Federal Office Building', 'GSA-SEA-2025-006',
 'General Services Administration', 'Public Buildings Service', 'GSA PBS Real Property Leasing',
 '2025-12-06', 'Solicitation', 'Solicitation', 'autocustom', '2026-03-30',
 'NONE', 'No Set aside used', '2026-02-28',
 '531120', 'X1AA', 'Yes', '18,000 SF LEED-certified office space in downtown Seattle. Green building standards required.', 'OFFICE',
 '98101', 'Seattle', 'USA', 'WA',
 '53033', 'Seattle', 'WA', 'Washington',
 '98101', 'USA', 'UNITED STATES', 'https://sam.gov/workspace/contract/opp/demo-006-gsa-lease-wa/view', 'gsa_leasing'),

-- 7. DC
('demo-007-gsa-lease-dc', 'Washington DC Federal Office Space', 'GSA-DC-2025-007',
 'General Services Administration', 'Public Buildings Service', 'GSA PBS Real Property Leasing',
 '2025-12-07', 'Solicitation', 'Solicitation', 'autocustom', '2026-04-15',
 'NONE', 'No Set aside used', '2026-03-15',
 '531120', 'X1AA', 'Yes', '35,000 SF high-security office space near Capitol Hill for federal operations. Enhanced security clearance required.', 'OFFICE',
 '20001', 'Washington', 'USA', 'DC',
 '11001', 'Washington', 'DC', 'District of Columbia',
 '20001', 'USA', 'UNITED STATES', 'https://sam.gov/workspace/contract/opp/demo-007-gsa-lease-dc/view', 'gsa_leasing'),

-- 8. Massachusetts
('demo-008-gsa-lease-ma', 'Boston Federal Building Lease', 'GSA-BOS-2025-008',
 'General Services Administration', 'Public Buildings Service', 'GSA PBS Real Property Leasing',
 '2025-12-08', 'Solicitation', 'Solicitation', 'autocustom', '2026-03-12',
 'NONE', 'No Set aside used', '2026-02-10',
 '531120', 'X1AA', 'Yes', '22,000 SF office space in Boston Financial District. Historic building renovation acceptable with compliance.', 'OFFICE',
 '02108', 'Boston', 'USA', 'MA',
 '25025', 'Boston', 'MA', 'Massachusetts',
 '02108', 'USA', 'UNITED STATES', 'https://sam.gov/workspace/contract/opp/demo-008-gsa-lease-ma/view', 'gsa_leasing'),

-- 9. Georgia
('demo-009-gsa-lease-ga', 'Atlanta Metro Federal Office', 'GSA-ATL-2025-009',
 'General Services Administration', 'Public Buildings Service', 'GSA PBS Real Property Leasing',
 '2025-12-09', 'Solicitation', 'Solicitation', 'autocustom', '2026-02-20',
 'NONE', 'No Set aside used', '2026-01-20',
 '531120', 'X1AA', 'Yes', '28,000 SF modern office facility in Atlanta for regional federal operations. Must accommodate 150+ employees.', 'OFFICE',
 '30303', 'Atlanta', 'USA', 'GA',
 '13121', 'Atlanta', 'GA', 'Georgia',
 '30303', 'USA', 'UNITED STATES', 'https://sam.gov/workspace/contract/opp/demo-009-gsa-lease-ga/view', 'gsa_leasing'),

-- 10. Colorado
('demo-010-gsa-lease-co', 'Denver Federal Office Complex', 'GSA-DEN-2025-010',
 'General Services Administration', 'Public Buildings Service', 'GSA PBS Real Property Leasing',
 '2025-12-10', 'Solicitation', 'Solicitation', 'autocustom', '2026-03-07',
 'NONE', 'No Set aside used', '2026-02-05',
 '531120', 'X1AA', 'Yes', '16,000 SF office space in downtown Denver with mountain views. Energy efficiency standards required.', 'OFFICE',
 '80202', 'Denver', 'USA', 'CO',
 '08031', 'Denver', 'CO', 'Colorado',
 '80202', 'USA', 'UNITED STATES', 'https://sam.gov/workspace/contract/opp/demo-010-gsa-lease-co/view', 'gsa_leasing'),

-- 11. Arizona
('demo-011-gsa-lease-az', 'Phoenix Federal Building Lease', 'GSA-PHX-2025-011',
 'General Services Administration', 'Public Buildings Service', 'GSA PBS Real Property Leasing',
 '2025-11-25', 'Solicitation', 'Solicitation', 'autocustom', '2026-04-10',
 'NONE', 'No Set aside used', '2026-03-10',
 '531120', 'X1AA', 'Yes', '24,000 SF office space in Phoenix metro area. Climate-controlled environment and backup power required.', 'OFFICE',
 '85004', 'Phoenix', 'USA', 'AZ',
 '04013', 'Phoenix', 'AZ', 'Arizona',
 '85004', 'USA', 'UNITED STATES', 'https://sam.gov/workspace/contract/opp/demo-011-gsa-lease-az/view', 'gsa_leasing'),

-- 12. Pennsylvania
('demo-012-gsa-lease-pa', 'Philadelphia Federal Office Space', 'GSA-PHL-2025-012',
 'General Services Administration', 'Public Buildings Service', 'GSA PBS Real Property Leasing',
 '2025-11-28', 'Solicitation', 'Solicitation', 'autocustom', '2026-02-28',
 'NONE', 'No Set aside used', '2026-01-28',
 '531120', 'X1AA', 'Yes', '19,000 SF office facility in Center City Philadelphia. Accessibility compliance mandatory.', 'OFFICE',
 '19107', 'Philadelphia', 'USA', 'PA',
 '42101', 'Philadelphia', 'PA', 'Pennsylvania',
 '19107', 'USA', 'UNITED STATES', 'https://sam.gov/workspace/contract/opp/demo-012-gsa-lease-pa/view', 'gsa_leasing'),

-- 13. North Carolina
('demo-013-gsa-lease-nc', 'Charlotte Federal Office Lease', 'GSA-CLT-2025-013',
 'General Services Administration', 'Public Buildings Service', 'GSA PBS Real Property Leasing',
 '2025-11-30', 'Solicitation', 'Solicitation', 'autocustom', '2026-03-14',
 'NONE', 'No Set aside used', '2026-02-12',
 '531120', 'X1AA', 'Yes', '21,000 SF professional office space in Charlotte Uptown district for federal agency.', 'OFFICE',
 '28202', 'Charlotte', 'USA', 'NC',
 '37119', 'Charlotte', 'NC', 'North Carolina',
 '28202', 'USA', 'UNITED STATES', 'https://sam.gov/workspace/contract/opp/demo-013-gsa-lease-nc/view', 'gsa_leasing'),

-- 14. Minnesota
('demo-014-gsa-lease-mn', 'Minneapolis Federal Building', 'GSA-MSP-2025-014',
 'General Services Administration', 'Public Buildings Service', 'GSA PBS Real Property Leasing',
 '2025-12-02', 'Solicitation', 'Solicitation', 'autocustom', '2026-03-27',
 'NONE', 'No Set aside used', '2026-02-25',
 '531120', 'X1AA', 'Yes', '17,000 SF heated office space in downtown Minneapolis. Winter climate control systems essential.', 'OFFICE',
 '55401', 'Minneapolis', 'USA', 'MN',
 '27053', 'Minneapolis', 'MN', 'Minnesota',
 '55401', 'USA', 'UNITED STATES', 'https://sam.gov/workspace/contract/opp/demo-014-gsa-lease-mn/view', 'gsa_leasing'),

-- 15. Oregon
('demo-015-gsa-lease-or', 'Portland Federal Office Complex', 'GSA-PDX-2025-015',
 'General Services Administration', 'Public Buildings Service', 'GSA PBS Real Property Leasing',
 '2025-12-04', 'Solicitation', 'Solicitation', 'autocustom', '2026-04-05',
 'NONE', 'No Set aside used', '2026-03-05',
 '531120', 'X1AA', 'Yes', '14,000 SF sustainable office building in Portland. LEED Gold certification preferred.', 'OFFICE',
 '97204', 'Portland', 'USA', 'OR',
 '41051', 'Portland', 'OR', 'Oregon',
 '97204', 'USA', 'UNITED STATES', 'https://sam.gov/workspace/contract/opp/demo-015-gsa-lease-or/view', 'gsa_leasing'),

-- 16. Nevada
('demo-016-gsa-lease-nv', 'Las Vegas Federal Office Lease', 'GSA-LAS-2025-016',
 'General Services Administration', 'Public Buildings Service', 'GSA PBS Real Property Leasing',
 '2025-11-26', 'Solicitation', 'Solicitation', 'autocustom', '2026-02-18',
 'NONE', 'No Set aside used', '2026-01-18',
 '531120', 'X1AA', 'Yes', '26,000 SF office space in Las Vegas for multiple federal agencies. High-efficiency cooling required.', 'OFFICE',
 '89101', 'Las Vegas', 'USA', 'NV',
 '32003', 'Las Vegas', 'NV', 'Nevada',
 '89101', 'USA', 'UNITED STATES', 'https://sam.gov/workspace/contract/opp/demo-016-gsa-lease-nv/view', 'gsa_leasing'),

-- 17. Virginia
('demo-017-gsa-lease-va', 'Arlington Federal Office Building', 'GSA-ARL-2025-017',
 'General Services Administration', 'Public Buildings Service', 'GSA PBS Real Property Leasing',
 '2025-12-01', 'Solicitation', 'Solicitation', 'autocustom', '2026-03-24',
 'NONE', 'No Set aside used', '2026-02-22',
 '531120', 'X1AA', 'Yes', '32,000 SF secure office facility near Pentagon. Top-secret clearance workspace included.', 'OFFICE',
 '22201', 'Arlington', 'USA', 'VA',
 '51013', 'Arlington', 'VA', 'Virginia',
 '22201', 'USA', 'UNITED STATES', 'https://sam.gov/workspace/contract/opp/demo-017-gsa-lease-va/view', 'gsa_leasing'),

-- 18. Missouri
('demo-018-gsa-lease-mo', 'Kansas City Federal Office Space', 'GSA-KC-2025-018',
 'General Services Administration', 'Public Buildings Service', 'GSA PBS Real Property Leasing',
 '2025-12-05', 'Solicitation', 'Solicitation', 'autocustom', '2026-03-10',
 'NONE', 'No Set aside used', '2026-02-08',
 '531120', 'X1AA', 'Yes', '15,000 SF office space in downtown Kansas City for regional federal operations.', 'OFFICE',
 '64105', 'Kansas City', 'USA', 'MO',
 '29095', 'Kansas City', 'MO', 'Missouri',
 '64105', 'USA', 'UNITED STATES', 'https://sam.gov/workspace/contract/opp/demo-018-gsa-lease-mo/view', 'gsa_leasing'),

-- 19. Tennessee
('demo-019-gsa-lease-tn', 'Nashville Federal Building Lease', 'GSA-NSH-2025-019',
 'General Services Administration', 'Public Buildings Service', 'GSA PBS Real Property Leasing',
 '2025-12-03', 'Solicitation', 'Solicitation', 'autocustom', '2026-04-12',
 'NONE', 'No Set aside used', '2026-03-12',
 '531120', 'X1AA', 'Yes', '20,000 SF modern office facility in Nashville metro for federal agency consolidation.', 'OFFICE',
 '37203', 'Nashville', 'USA', 'TN',
 '47037', 'Nashville', 'TN', 'Tennessee',
 '37203', 'USA', 'UNITED STATES', 'https://sam.gov/workspace/contract/opp/demo-019-gsa-lease-tn/view', 'gsa_leasing'),

-- 20. Michigan
('demo-020-gsa-lease-mi', 'Detroit Federal Office Complex', 'GSA-DET-2025-020',
 'General Services Administration', 'Public Buildings Service', 'GSA PBS Real Property Leasing',
 '2025-11-29', 'Solicitation', 'Solicitation', 'autocustom', '2026-02-22',
 'NONE', 'No Set aside used', '2026-01-22',
 '531120', 'X1AA', 'Yes', '23,000 SF office building in downtown Detroit for federal government operations. Revitalization area preference.', 'OFFICE',
 '48226', 'Detroit', 'USA', 'MI',
 '26163', 'Detroit', 'MI', 'Michigan',
 '48226', 'USA', 'UNITED STATES', 'https://sam.gov/workspace/contract/opp/demo-020-gsa-lease-mi/view', 'gsa_leasing')

ON CONFLICT (notice_id) DO UPDATE SET
  title = EXCLUDED.title,
  response_deadline = EXCLUDED.response_deadline,
  description = EXCLUDED.description,
  last_synced_at = NOW();
