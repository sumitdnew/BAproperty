-- Fix RLS policies for user signup/creation
-- This resolves the database error when creating new accounts

-- ============================================
-- 1. Fix user_profiles table RLS policies
-- ============================================

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "System can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON user_profiles;

-- Enable RLS on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies

-- 1. Allow users to view their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- 2. Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 3. Allow ANY authenticated user to insert profiles (for signup)
CREATE POLICY "Authenticated users can insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. Allow service role to do everything (for admin operations)
CREATE POLICY "Service role can manage profiles" ON user_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 2. Fix tenants table RLS policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own tenant data" ON tenants;
DROP POLICY IF EXISTS "Users can update own tenant data" ON tenants;
DROP POLICY IF EXISTS "Authenticated users can insert own tenant records" ON tenants;
DROP POLICY IF EXISTS "Admins can manage all tenants" ON tenants;

-- Enable RLS on tenants table
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Create simple policies
CREATE POLICY "Users can view own tenant data" ON tenants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own tenant data" ON tenants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert tenant records" ON tenants
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage tenants" ON tenants
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 3. Fix invitations table RLS policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view invitations" ON invitations;
DROP POLICY IF EXISTS "Admins can manage invitations" ON invitations;
DROP POLICY IF EXISTS "Service role can manage invitations" ON invitations;

-- Enable RLS on invitations table
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Service role can manage invitations" ON invitations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can view invitations" ON invitations
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================
-- 4. Grant necessary permissions
-- ============================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON tenants TO authenticated;
GRANT ALL ON invitations TO authenticated;

-- ============================================
-- 5. Verify policies were created
-- ============================================

SELECT 'User Profiles Policies:' as info;
SELECT tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

SELECT 'Tenants Policies:' as info;
SELECT tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'tenants'
ORDER BY policyname;

SELECT 'Invitations Policies:' as info;
SELECT tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'invitations'
ORDER BY policyname;
