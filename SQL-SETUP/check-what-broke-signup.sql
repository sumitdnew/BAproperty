-- Check what might have broken signup
-- Since it was working before, something changed

-- ============================================
-- 1. Check for any triggers on auth.users
-- ============================================

SELECT 'Triggers on auth.users:' as info;
SELECT 
    t.tgname as trigger_name,
    t.tgenabled,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE n.nspname = 'auth' 
AND c.relname = 'users'
ORDER BY t.tgname;

-- ============================================
-- 2. Check for any functions that might be causing issues
-- ============================================

SELECT 'Functions that might affect signup:' as info;
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname IN ('public', 'auth')
AND (p.proname LIKE '%user%' OR p.proname LIKE '%signup%' OR p.proname LIKE '%auth%')
ORDER BY p.proname;

-- ============================================
-- 3. Check if there are any recent changes to user_profiles table
-- ============================================

SELECT 'User profiles table structure:' as info;
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
-- 4. Check for any constraints that might be failing
-- ============================================

SELECT 'Constraints on user_profiles:' as info;
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
AND tc.table_name = 'user_profiles'
ORDER BY tc.constraint_type, tc.constraint_name;

-- ============================================
-- 5. Test if we can insert a simple record
-- ============================================

SELECT 'Testing simple insert...' as info;

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
    RAISE NOTICE 'SUCCESS: Simple insert works!';
    
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: Simple insert failed: %', SQLERRM;
END $$;
