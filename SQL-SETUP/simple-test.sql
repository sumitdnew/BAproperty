-- Simple test to see what's blocking signup

-- Test 1: Check if we can insert into user_profiles
DO $$ 
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Try to insert a test record
    INSERT INTO user_profiles (id, user_type, first_name, last_name) 
    VALUES (test_user_id, 'test', 'Test', 'User');
    
    -- If we get here, delete the test record
    DELETE FROM user_profiles WHERE id = test_user_id;
    RAISE NOTICE 'SUCCESS: user_profiles insert works!';
    
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: user_profiles insert failed: %', SQLERRM;
END $$;

-- Test 2: Check current RLS status
SELECT 'RLS Status:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- Test 3: Check current policies
SELECT 'Current Policies:' as info;
SELECT 
    tablename,
    policyname,
    cmd as operation
FROM pg_policies 
WHERE tablename = 'user_profiles';
