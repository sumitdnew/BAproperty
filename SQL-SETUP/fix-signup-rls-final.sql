-- Final fix for signup RLS policies
-- This allows the signup process to work properly

-- ============================================
-- 1. Fix user_profiles table RLS policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "System can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON user_profiles;

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies that work for signup
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- CRITICAL: Allow any authenticated user to insert profiles (for signup)
CREATE POLICY "Allow profile creation during signup" ON user_profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow service role to do everything
CREATE POLICY "Service role can manage profiles" ON user_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 2. Grant necessary permissions
-- ============================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_profiles TO authenticated;

-- ============================================
-- 3. Verify policies were created
-- ============================================

SELECT 'User Profiles Policies:' as info;
SELECT tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

SELECT 'Fix completed! Try creating a new account now.' as result;

