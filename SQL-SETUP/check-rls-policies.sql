-- Check RLS policies for user_profiles and tenants tables

-- ============================================
-- 1. Check RLS status
-- ============================================

SELECT 'RLS Status:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'tenants', 'admin_building_access')
ORDER BY tablename;

-- ============================================
-- 2. Check RLS policies for user_profiles
-- ============================================

SELECT 'user_profiles Policies:' as info;
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- ============================================
-- 3. Check RLS policies for tenants
-- ============================================

SELECT 'tenants Policies:' as info;
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'tenants'
ORDER BY policyname;

-- ============================================
-- 4. Check RLS policies for admin_building_access
-- ============================================

SELECT 'admin_building_access Policies:' as info;
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'admin_building_access'
ORDER BY policyname;

-- ============================================
-- 5. Test if current user can access their own profile
-- ============================================

SELECT 'Current User Profile Access Test:' as info;
SELECT 
    id,
    first_name,
    last_name,
    email,
    user_type
FROM user_profiles 
WHERE id = auth.uid();

-- ============================================
-- 6. Test if current user can access tenant records
-- ============================================

SELECT 'Current User Tenant Access Test:' as info;
SELECT 
    id,
    user_id,
    apartment_id,
    is_active
FROM tenants 
WHERE user_id = auth.uid();


