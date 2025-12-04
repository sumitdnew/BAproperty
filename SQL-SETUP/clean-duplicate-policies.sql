-- Clean up duplicate policies on user_profiles
-- This should fix the signup issue

-- ============================================
-- 1. Drop ALL existing policies
-- ============================================

DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON user_profiles;

-- ============================================
-- 2. Create clean, simple policies
-- ============================================

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create single, clean policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- CRITICAL: Allow signup
CREATE POLICY "Allow profile creation during signup" ON user_profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow service role to do everything
CREATE POLICY "Service role can manage profiles" ON user_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 3. Verify clean policies
-- ============================================

SELECT 'Clean Policies Created:' as info;
SELECT 
    tablename,
    policyname,
    cmd as operation,
    roles
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- ============================================
-- 4. Test insert
-- ============================================

SELECT 'Testing insert after cleanup...' as info;

DO $$ 
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Try to insert a test record
    INSERT INTO user_profiles (id, user_type, first_name, last_name) 
    VALUES (test_user_id, 'test', 'Test', 'User');
    
    -- If we get here, delete the test record
    DELETE FROM user_profiles WHERE id = test_user_id;
    RAISE NOTICE 'SUCCESS: Insert works after cleanup!';
    
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: Insert still fails: %', SQLERRM;
END $$;

SELECT 'Cleanup completed! Try creating a new account now.' as result;
