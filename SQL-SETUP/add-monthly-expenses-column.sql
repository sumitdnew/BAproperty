-- Add monthly_expenses column to apartments table
ALTER TABLE apartments 
ADD COLUMN IF NOT EXISTS monthly_expenses DECIMAL(12,2) DEFAULT 0;

-- Add comment to explain the difference
COMMENT ON COLUMN apartments.monthly_rent IS 'Monthly rent amount charged to tenant';
COMMENT ON COLUMN apartments.monthly_expenses IS 'Monthly expenses/costs for the apartment';

