-- Diagnostic script to check why buildings dropdown is not showing all buildings
-- Run this script to identify the issue

-- 1. Check if RLS is enabled on admin_building_access table
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'admin_building_access';

-- 2. Check existing RLS policies on admin_building_access
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as operation,
    qual as using_expression,
    with_check
FROM pg_policies 
WHERE tablename = 'admin_building_access'
ORDER BY policyname;

-- 3. Check if RLS is enabled on buildings table
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'buildings';

-- 4. Check existing RLS policies on buildings table (if any)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as operation,
    qual as using_expression,
    with_check
FROM pg_policies 
WHERE tablename = 'buildings'
ORDER BY policyname;

-- 5. Count total buildings in the database
SELECT COUNT(*) as total_buildings FROM buildings;

-- 6. List all buildings
SELECT id, name FROM buildings ORDER BY name;

-- 7. Check admin_building_access records for your user
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users
SELECT 
    aba.admin_id,
    up.first_name || ' ' || up.last_name as admin_name,
    aba.building_id,
    b.name as building_name,
    aba.access_level
FROM admin_building_access aba
LEFT JOIN user_profiles up ON aba.admin_id = up.id
LEFT JOIN buildings b ON aba.building_id = b.id
-- WHERE aba.admin_id = 'YOUR_USER_ID'  -- Uncomment and replace with your user ID
ORDER BY admin_name, building_name;

-- 8. Check if the current user is in user_profiles and their user_type
SELECT 
    id,
    user_type,
    first_name || ' ' || last_name as full_name,
    created_at
FROM user_profiles
-- WHERE id = 'YOUR_USER_ID'  -- Uncomment and replace with your user ID
ORDER BY created_at DESC;

-- EXPECTED RESULTS:
-- If RLS is enabled on admin_building_access but no policies exist, that's the issue
-- The fix is to run the fix-admin-building-access-rls.sql script



