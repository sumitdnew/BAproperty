-- Update invitations table to support Supabase auth invitations
-- This migration adds new columns and updates existing ones

-- Add new columns to support Supabase auth integration
ALTER TABLE invitations 
ADD COLUMN IF NOT EXISTS auth_user_id UUID,
ADD COLUMN IF NOT EXISTS building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS invitation_type VARCHAR(20) DEFAULT 'tenant';

-- Update existing columns to match our new structure
ALTER TABLE invitations 
ALTER COLUMN role DROP NOT NULL;

-- Add new status values
-- First, drop the existing constraint if it exists
ALTER TABLE invitations 
DROP CONSTRAINT IF EXISTS invitations_status_check;

-- Update existing rows to use valid status values
UPDATE invitations 
SET status = 'pending' 
WHERE status NOT IN ('pending', 'sent', 'accepted', 'expired', 'cancelled');

-- Add the new constraint only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'invitations_status_check' 
        AND conrelid = 'invitations'::regclass
    ) THEN
        ALTER TABLE invitations 
        ADD CONSTRAINT invitations_status_check 
        CHECK (status IN ('pending', 'sent', 'accepted', 'expired', 'cancelled'));
    END IF;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_invitations_auth_user_id ON invitations(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_building_id ON invitations(building_id);
CREATE INDEX IF NOT EXISTS idx_invitations_apartment_id ON invitations(apartment_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);

-- Update RLS policies for invitations table
DROP POLICY IF EXISTS "Users can view their own invitations" ON invitations;
DROP POLICY IF EXISTS "Admins can manage all invitations" ON invitations;

-- Allow users to view their own invitations
CREATE POLICY "Users can view their own invitations" ON invitations
  FOR SELECT USING (
    auth.uid()::text = auth_user_id::text OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Allow admins to manage all invitations
CREATE POLICY "Admins can manage all invitations" ON invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_building_access 
      WHERE admin_id = auth.uid()
    )
  );

-- Allow system to insert invitations (for the invitation process)
CREATE POLICY "System can insert invitations" ON invitations
  FOR INSERT WITH CHECK (true);

-- Allow system to update invitation status
CREATE POLICY "System can update invitation status" ON invitations
  FOR UPDATE USING (true);
