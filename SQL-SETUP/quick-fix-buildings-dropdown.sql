-- QUICK FIX for Buildings Dropdown Issue
-- This script ensures buildings are accessible to all authenticated users

-- ============================================
-- OPTION 1: If you want ALL users to see ALL buildings
-- ============================================

-- Ensure buildings table RLS allows all authenticated users to read
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

-- Drop any restrictive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON buildings;
DROP POLICY IF EXISTS "Authenticated users can view buildings" ON buildings;
DROP POLICY IF EXISTS "Users can view all buildings" ON buildings;

-- Create a policy that allows all authenticated users to view all buildings
CREATE POLICY "Authenticated users can view all buildings"
ON buildings
FOR SELECT
TO authenticated
USING (true);

-- Allow admins to manage buildings
CREATE POLICY "Admins can manage buildings"
ON buildings
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND user_type IN ('admin', 'property_manager', 'building_owner')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND user_type IN ('admin', 'property_manager', 'building_owner')
    )
);

-- ============================================
-- OPTION 2: Fix admin_building_access table policies
-- ============================================

-- Ensure admin_building_access has proper policies
ALTER TABLE admin_building_access ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own building access" ON admin_building_access;
DROP POLICY IF EXISTS "Admins can insert their own building access" ON admin_building_access;
DROP POLICY IF EXISTS "Admins can update their own building access" ON admin_building_access;
DROP POLICY IF EXISTS "Admins can delete their own building access" ON admin_building_access;

-- Allow users to view their own building access
CREATE POLICY "Users can view their own building access"
ON admin_building_access
FOR SELECT
TO authenticated
USING (admin_id = auth.uid());

-- Allow admins to manage building access (for super admins)
CREATE POLICY "Super admins can manage all building access"
ON admin_building_access
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND user_type IN ('admin', 'property_manager', 'building_owner')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND user_type IN ('admin', 'property_manager', 'building_owner')
    )
);

-- ============================================
-- Verification
-- ============================================

-- Check buildings policies
SELECT 'Buildings Policies:' as info;
SELECT tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'buildings';

-- Check admin_building_access policies
SELECT 'Admin Building Access Policies:' as info;
SELECT tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'admin_building_access';

-- Test query: Can you see buildings?
SELECT 'Buildings Count:' as info, COUNT(*) as count FROM buildings;

