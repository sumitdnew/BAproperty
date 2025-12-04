-- Fix signup when user is not authenticated yet
-- This allows profile creation during the signup process

-- ============================================
-- 1. Temporarily disable RLS for signup testing
-- ============================================

-- Disable RLS on user_profiles to allow signup
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. Test if signup works now
-- ============================================

SELECT 'RLS disabled on user_profiles. Try creating a new account now.' as result;
SELECT 'If signup works, we know RLS was the issue.' as note;

-- ============================================
-- 3. Alternative: Create a more permissive policy
-- ============================================

-- If you want to keep RLS enabled, uncomment this section:
/*
-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON user_profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON user_profiles;

-- Create very permissive policies for signup
CREATE POLICY "Allow all authenticated operations" ON user_profiles
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage profiles" ON user_profiles
  FOR ALL USING (auth.role() = 'service_role');
*/

SELECT 'Choose one approach:' as info;
SELECT '1. Keep RLS disabled (simpler, less secure)' as option1;
SELECT '2. Use permissive policies (more secure but allows all authenticated users)' as option2;
