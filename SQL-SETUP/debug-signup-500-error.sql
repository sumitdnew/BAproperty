-- Debug script for 500 signup errors
-- This will help identify the root cause

-- ============================================
-- 1. Check if there are any database triggers causing issues
-- ============================================

SELECT 'Database Triggers:' as info;
SELECT 
    schemaname,
    tablename,
    triggername,
    tgtype,
    tgenabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' 
AND c.relname IN ('user_profiles', 'tenants', 'invitations')
ORDER BY tablename, triggername;

-- ============================================
-- 2. Check for any functions that might be causing issues
-- ============================================

SELECT 'Custom Functions:' as info;
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname LIKE '%user%' OR p.proname LIKE '%profile%' OR p.proname LIKE '%tenant%'
ORDER BY p.proname;

-- ============================================
-- 3. Check table constraints
-- ============================================

SELECT 'Table Constraints:' as info;
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
AND tc.table_name IN ('user_profiles', 'tenants', 'invitations')
ORDER BY tc.table_name, tc.constraint_type;

-- ============================================
-- 4. Check for any RLS policies that might be recursive
-- ============================================

SELECT 'Recursive Policy Check:' as info;
SELECT 
    tablename,
    policyname,
    qual as using_expression,
    with_check
FROM pg_policies 
WHERE (qual LIKE '%user_profiles%' OR with_check LIKE '%user_profiles%')
   OR (qual LIKE '%tenants%' OR with_check LIKE '%tenants%')
   OR (qual LIKE '%invitations%' OR with_check LIKE '%invitations%')
ORDER BY tablename, policyname;

-- ============================================
-- 5. Test a simple insert to user_profiles
-- ============================================

-- This will show if there are any underlying issues
SELECT 'Testing user_profiles insert...' as info;

-- Try to insert a test record (this will fail but show the error)
DO $$ 
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    -- Try to insert a test record
    INSERT INTO user_profiles (id, user_type, first_name, last_name) 
    VALUES (test_user_id, 'test', 'Test', 'User');
    
    -- If we get here, delete the test record
    DELETE FROM user_profiles WHERE id = test_user_id;
    RAISE NOTICE 'Insert test PASSED - user_profiles table is accessible';
    
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Insert test FAILED: %', SQLERRM;
END $$;

-- ============================================
-- 6. Check current user context
-- ============================================

SELECT 'Current User Context:' as info;
SELECT 
    auth.uid() as current_user_id,
    auth.role() as current_role,
    current_user as database_user,
    session_user as session_user;
