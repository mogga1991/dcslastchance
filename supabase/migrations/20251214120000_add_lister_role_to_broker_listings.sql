-- Add lister_role enum type
CREATE TYPE lister_role AS ENUM (
  'owner',
  'broker',
  'agent',
  'salesperson'
);

-- Add lister_role column to broker_listings
ALTER TABLE broker_listings
ADD COLUMN lister_role lister_role;

-- Add license_number column (required for broker/agent, optional for salesperson)
ALTER TABLE broker_listings
ADD COLUMN license_number TEXT;

-- Add brokerage_company column (required for broker/agent/salesperson)
ALTER TABLE broker_listings
ADD COLUMN brokerage_company TEXT;

-- Update existing records to have a default lister_role (set to 'broker')
UPDATE broker_listings
SET lister_role = 'broker'
WHERE lister_role IS NULL;

-- Make lister_role required for new records
ALTER TABLE broker_listings
ALTER COLUMN lister_role SET NOT NULL;

-- Add index on lister_role for filtering
CREATE INDEX idx_broker_listings_lister_role ON broker_listings(lister_role);

-- Add comments
COMMENT ON COLUMN broker_listings.lister_role IS 'Role of the person listing the property (owner, broker, agent, salesperson)';
COMMENT ON COLUMN broker_listings.license_number IS 'Real estate license number (required for broker/agent, optional for salesperson)';
COMMENT ON COLUMN broker_listings.brokerage_company IS 'Name of the brokerage company (required for broker/agent/salesperson)';
