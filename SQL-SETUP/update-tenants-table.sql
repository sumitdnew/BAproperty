-- Update tenants table to support invitation workflow
-- This migration adds any missing columns and updates existing ones

-- Add missing columns if they don't exist
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Update existing columns to match our new structure
-- Ensure is_active column exists and has proper default
ALTER TABLE tenants 
ALTER COLUMN is_active SET DEFAULT TRUE;

-- Add status constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'tenants_status_check' 
        AND conrelid = 'tenants'::regclass
    ) THEN
        ALTER TABLE tenants 
        ADD CONSTRAINT tenants_status_check 
        CHECK (status IN ('pending', 'active', 'inactive', 'terminated'));
    END IF;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_tenants_user_id ON tenants(user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_apartment_id ON tenants(apartment_id);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_is_active ON tenants(is_active);

-- Update RLS policies for tenants table
DROP POLICY IF EXISTS "Users can view their own tenant record" ON tenants;
DROP POLICY IF EXISTS "Admins can manage all tenants" ON tenants;

-- Allow users to view their own tenant record
CREATE POLICY "Users can view their own tenant record" ON tenants
  FOR SELECT USING (
    auth.uid()::text = user_id::text
  );

-- Allow admins to manage all tenants
CREATE POLICY "Admins can manage all tenants" ON tenants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_building_access 
      WHERE admin_id = auth.uid()
    )
  );

-- Allow system to insert tenants (for the invitation process)
CREATE POLICY "System can insert tenants" ON tenants
  FOR INSERT WITH CHECK (true);

-- Allow system to update tenant status
CREATE POLICY "System can update tenant status" ON tenants
  FOR UPDATE USING (true);
