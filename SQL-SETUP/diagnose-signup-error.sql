-- Diagnostic script to identify signup/account creation issues
-- Run this to check the current state of RLS policies

-- ============================================
-- 1. Check RLS status on key tables
-- ============================================

SELECT 'RLS Status on Key Tables:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'tenants', 'invitations', 'admin_building_access')
ORDER BY tablename;

-- ============================================
-- 2. Check existing policies on user_profiles
-- ============================================

SELECT 'User Profiles Policies:' as info;
SELECT 
    policyname,
    permissive,
    roles,
    cmd as operation,
    qual as using_expression,
    with_check
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- ============================================
-- 3. Check existing policies on tenants
-- ============================================

SELECT 'Tenants Policies:' as info;
SELECT 
    policyname,
    permissive,
    roles,
    cmd as operation,
    qual as using_expression,
    with_check
FROM pg_policies 
WHERE tablename = 'tenants'
ORDER BY policyname;

-- ============================================
-- 4. Check existing policies on invitations
-- ============================================

SELECT 'Invitations Policies:' as info;
SELECT 
    policyname,
    permissive,
    roles,
    cmd as operation,
    qual as using_expression,
    with_check
FROM pg_policies 
WHERE tablename = 'invitations'
ORDER BY policyname;

-- ============================================
-- 5. Test if we can insert into user_profiles
-- ============================================

-- This will show if there are any permission issues
SELECT 'Testing user_profiles insert permissions...' as info;

-- Try to insert a test record (this will fail but show the error)
-- DO $$ 
-- BEGIN
--   INSERT INTO user_profiles (id, user_type, first_name, last_name) 
--   VALUES ('00000000-0000-0000-0000-000000000000', 'test', 'Test', 'User');
-- EXCEPTION 
--   WHEN OTHERS THEN
--     RAISE NOTICE 'Insert test failed: %', SQLERRM;
-- END $$;

-- ============================================
-- 6. Check for recursive policy issues
-- ============================================

SELECT 'Checking for recursive policies...' as info;
SELECT 
    tablename,
    policyname,
    qual as using_expression
FROM pg_policies 
WHERE tablename = 'user_profiles' 
AND qual LIKE '%user_profiles%'
ORDER BY tablename, policyname;

-- ============================================
-- 7. Check current user permissions
-- ============================================

SELECT 'Current User Info:' as info;
SELECT 
    auth.uid() as current_user_id,
    auth.role() as current_role;

-- ============================================
-- EXPECTED RESULTS:
-- ============================================
-- If you see "no policies" for user_profiles, that's the problem
-- If you see recursive policies (policies that reference user_profiles), that's also a problem
-- The fix is to run fix-user-signup-rls.sql
