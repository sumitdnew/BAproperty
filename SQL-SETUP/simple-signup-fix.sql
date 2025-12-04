-- Simple fix for user signup - handles existing policies
-- This will fix the database error when creating new accounts

-- ============================================
-- Fix user_profiles table (the main issue)
-- ============================================

-- Drop existing policies (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "System can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON user_profiles;

-- Enable RLS on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create the essential policies for signup to work
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- THIS IS THE KEY POLICY - allows signup
CREATE POLICY "Authenticated users can insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow service role to do everything
CREATE POLICY "Service role can manage profiles" ON user_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- Verify the fix worked
-- ============================================

SELECT 'User Profiles Policies Created:' as info;
SELECT tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- Test message
SELECT 'Fix completed! Try creating a new account now.' as result;
