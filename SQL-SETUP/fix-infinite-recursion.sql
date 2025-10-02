-- Fix infinite recursion in RLS policies
-- This script removes the problematic policies and creates simpler, non-recursive ones

-- 1. Drop ALL existing policies on user_profiles to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "System can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON user_profiles;

-- 2. Create simple, non-recursive policies for user_profiles
-- Allow users to view and update their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow service role to do everything (for invitation process)
CREATE POLICY "Service role can manage profiles" ON user_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to insert profiles (for signup process)
CREATE POLICY "Authenticated users can insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Fix tenants table policies (remove any recursive references)
DROP POLICY IF EXISTS "Users can view their own tenant record" ON tenants;
DROP POLICY IF EXISTS "Admins can manage all tenants" ON tenants;
DROP POLICY IF EXISTS "System can insert tenants" ON tenants;
DROP POLICY IF EXISTS "System can update tenant status" ON tenants;
DROP POLICY IF EXISTS "Service role can manage tenants" ON tenants;

CREATE POLICY "Users can view their own tenant record" ON tenants
  FOR SELECT USING (auth.uid() = user_id);

-- Allow service role to do everything (for invitation process)
CREATE POLICY "Service role can manage tenants" ON tenants
  FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to insert tenants
CREATE POLICY "Authenticated users can insert tenants" ON tenants
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. Fix invitations table policies
DROP POLICY IF EXISTS "Users can view their own invitations" ON invitations;
DROP POLICY IF EXISTS "Admins can manage all invitations" ON invitations;
DROP POLICY IF EXISTS "System can insert invitations" ON invitations;
DROP POLICY IF EXISTS "System can update invitation status" ON invitations;
DROP POLICY IF EXISTS "Service role can manage invitations" ON invitations;

CREATE POLICY "Users can view their own invitations" ON invitations
  FOR SELECT USING (auth.uid()::text = auth_user_id::text);

-- Allow service role to do everything (for invitation process)
CREATE POLICY "Service role can manage invitations" ON invitations
  FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to insert invitations
CREATE POLICY "Authenticated users can insert invitations" ON invitations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. Ensure RLS is enabled on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- 6. Grant necessary permissions to service role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON user_profiles TO service_role;
GRANT ALL ON tenants TO service_role;
GRANT ALL ON invitations TO service_role;
GRANT ALL ON apartments TO service_role;
GRANT ALL ON buildings TO service_role;

-- 7. Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON tenants TO authenticated;
GRANT ALL ON invitations TO authenticated;
GRANT ALL ON apartments TO authenticated;
GRANT ALL ON buildings TO authenticated;

-- 8. Create a simple function to check user type (without recursion)
CREATE OR REPLACE FUNCTION get_user_type(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_type_result TEXT;
BEGIN
  SELECT user_type INTO user_type_result 
  FROM user_profiles 
  WHERE id = user_id;
  
  RETURN COALESCE(user_type_result, 'tenant');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_type(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION get_user_type(UUID) TO authenticated;

