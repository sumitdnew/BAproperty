-- Clean debug script for signup issues
-- This handles existing policies properly

-- ============================================
-- 1. Check current RLS status
-- ============================================

SELECT 'Current RLS Status:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'tenants', 'invitations')
ORDER BY tablename;

-- ============================================
-- 2. Check existing policies
-- ============================================

SELECT 'Current Policies:' as info;
SELECT 
    tablename,
    policyname,
    cmd as operation,
    roles
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'tenants', 'invitations')
ORDER BY tablename, policyname;

-- ============================================
-- 3. Test user_profiles insert (the main issue)
-- ============================================

SELECT 'Testing user_profiles insert...' as info;

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
    RAISE NOTICE 'SUCCESS: user_profiles insert works!';
    
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: user_profiles insert failed: %', SQLERRM;
END $$;

-- ============================================
-- 4. Check for any database triggers
-- ============================================

SELECT 'Database Triggers:' as info;
SELECT 
    n.nspname as schemaname,
    c.relname as tablename,
    t.tgname as triggername,
    t.tgenabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' 
AND c.relname = 'user_profiles'
ORDER BY t.tgname;

-- ============================================
-- 5. Check table structure
-- ============================================

SELECT 'User Profiles Table Structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================
-- 6. Check current user context
-- ============================================

SELECT 'Current User Context:' as info;
SELECT 
    auth.uid() as current_user_id,
    auth.role() as current_role,
    current_user as database_user;
