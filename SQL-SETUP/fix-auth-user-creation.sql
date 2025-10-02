-- Fix authentication user creation issues
-- This script addresses RLS policies and permissions that may be blocking user creation

-- 1. First, let's check and fix user_profiles table RLS policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "System can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON user_profiles;

-- Create comprehensive policies for user_profiles table
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() 
      AND up.user_type IN ('admin', 'property_manager', 'building_owner')
    )
  );

-- CRITICAL: Allow service role to manage profiles (for invitation process)
CREATE POLICY "Service role can manage profiles" ON user_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Allow system operations (for invitation process)
CREATE POLICY "System can insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update profiles" ON user_profiles
  FOR UPDATE USING (true);

-- 2. Ensure RLS is enabled on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Fix tenants table RLS policies
DROP POLICY IF EXISTS "Users can view their own tenant record" ON tenants;
DROP POLICY IF EXISTS "Admins can manage all tenants" ON tenants;
DROP POLICY IF EXISTS "System can insert tenants" ON tenants;
DROP POLICY IF EXISTS "System can update tenant status" ON tenants;
DROP POLICY IF EXISTS "Service role can manage tenants" ON tenants;

CREATE POLICY "Users can view their own tenant record" ON tenants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all tenants" ON tenants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() 
      AND up.user_type IN ('admin', 'property_manager', 'building_owner')
    )
  );

-- CRITICAL: Allow service role to manage tenants
CREATE POLICY "Service role can manage tenants" ON tenants
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "System can insert tenants" ON tenants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update tenant status" ON tenants
  FOR UPDATE USING (true);

-- 4. Fix invitations table RLS policies
DROP POLICY IF EXISTS "Users can view their own invitations" ON invitations;
DROP POLICY IF EXISTS "Admins can manage all invitations" ON invitations;
DROP POLICY IF EXISTS "System can insert invitations" ON invitations;
DROP POLICY IF EXISTS "System can update invitation status" ON invitations;
DROP POLICY IF EXISTS "Service role can manage invitations" ON invitations;

CREATE POLICY "Users can view their own invitations" ON invitations
  FOR SELECT USING (auth.uid()::text = auth_user_id::text);

CREATE POLICY "Admins can manage all invitations" ON invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() 
      AND up.user_type IN ('admin', 'property_manager', 'building_owner')
    )
  );

-- CRITICAL: Allow service role to manage invitations
CREATE POLICY "Service role can manage invitations" ON invitations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "System can insert invitations" ON invitations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update invitation status" ON invitations
  FOR UPDATE USING (true);

-- 5. Ensure RLS is enabled on all related tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- 6. Grant necessary permissions to service role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON user_profiles TO service_role;
GRANT ALL ON tenants TO service_role;
GRANT ALL ON invitations TO service_role;
GRANT ALL ON apartments TO service_role;
GRANT ALL ON buildings TO service_role;

-- 7. Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = user_id 
    AND user_type IN ('admin', 'property_manager', 'building_owner')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;

-- 9. Ensure the service role has access to auth schema (if needed)
-- Note: This might not be necessary depending on your Supabase setup
-- GRANT USAGE ON SCHEMA auth TO service_role;
