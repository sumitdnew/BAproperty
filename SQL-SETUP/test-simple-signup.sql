-- Test simple signup without user_profiles creation
-- This helps isolate if the issue is with auth or user_profiles

-- ============================================
-- 1. Temporarily disable RLS on user_profiles for testing
-- ============================================

-- This will help us test if RLS is the issue
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. Test if we can insert into user_profiles now
-- ============================================

SELECT 'Testing user_profiles insert with RLS disabled...' as info;

-- Try to insert a test record
DO $$ 
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Try to insert a test record
    INSERT INTO user_profiles (id, user_type, first_name, last_name) 
    VALUES (test_user_id, 'test', 'Test', 'User');
    
    -- If we get here, delete the test record
    DELETE FROM user_profiles WHERE id = test_user_id;
    RAISE NOTICE 'Insert test PASSED with RLS disabled';
    
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Insert test FAILED even with RLS disabled: %', SQLERRM;
END $$;

-- ============================================
-- 3. Re-enable RLS and recreate policies
-- ============================================

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Recreate the essential policy
DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON user_profiles;
CREATE POLICY "Authenticated users can insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- 4. Test with RLS enabled again
-- ============================================

SELECT 'Testing user_profiles insert with RLS enabled...' as info;

-- Try to insert a test record
DO $$ 
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000002';
BEGIN
    -- Try to insert a test record
    INSERT INTO user_profiles (id, user_type, first_name, last_name) 
    VALUES (test_user_id, 'test', 'Test', 'User');
    
    -- If we get here, delete the test record
    DELETE FROM user_profiles WHERE id = test_user_id;
    RAISE NOTICE 'Insert test PASSED with RLS enabled';
    
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Insert test FAILED with RLS enabled: %', SQLERRM;
END $$;

SELECT 'Test completed. Check the messages above.' as result;

