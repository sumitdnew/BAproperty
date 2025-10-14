-- Fix admin_building_access RLS policies
-- This ensures users can read their building access records

-- First, check if RLS is enabled
-- ALTER TABLE admin_building_access ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own building access" ON admin_building_access;
DROP POLICY IF EXISTS "Admins can manage their own building access" ON admin_building_access;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON admin_building_access;

-- Create policy to allow users to view their own building access
CREATE POLICY "Users can view their own building access"
ON admin_building_access
FOR SELECT
TO authenticated
USING (admin_id = auth.uid());

-- Create policy to allow users to insert their own building access
CREATE POLICY "Admins can insert their own building access"
ON admin_building_access
FOR INSERT
TO authenticated
WITH CHECK (admin_id = auth.uid());

-- Create policy to allow users to update their own building access
CREATE POLICY "Admins can update their own building access"
ON admin_building_access
FOR UPDATE
TO authenticated
USING (admin_id = auth.uid());

-- Create policy to allow users to delete their own building access
CREATE POLICY "Admins can delete their own building access"
ON admin_building_access
FOR DELETE
TO authenticated
USING (admin_id = auth.uid());

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'admin_building_access';

