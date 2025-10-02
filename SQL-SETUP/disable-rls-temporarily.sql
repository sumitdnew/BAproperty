-- TEMPORARY FIX: Disable RLS to get the app working
-- WARNING: This removes security, only use for testing/debugging

-- Disable RLS on all tables temporarily
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE invitations DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to service_role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON user_profiles TO service_role;
GRANT ALL ON tenants TO service_role;
GRANT ALL ON invitations TO service_role;
GRANT ALL ON apartments TO service_role;
GRANT ALL ON buildings TO service_role;

-- Grant all permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON tenants TO authenticated;
GRANT ALL ON invitations TO authenticated;
GRANT ALL ON apartments TO authenticated;
GRANT ALL ON buildings TO authenticated;

-- This should immediately fix the infinite recursion issue
-- You can re-enable RLS later with proper policies
