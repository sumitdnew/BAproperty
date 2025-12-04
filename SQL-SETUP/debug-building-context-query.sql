-- Debug the exact query that BuildingContext uses
-- Replace 'USER_ID_HERE' with the actual Test Admin user ID

-- ============================================
-- 1. Get the Test Admin user ID
-- ============================================

SELECT 'Test Admin User ID:' as info;
SELECT 
    up.id as user_id,
    up.first_name || ' ' || up.last_name as full_name,
    up.email,
    up.user_type
FROM user_profiles up
WHERE up.email = 'testadmin@ba-property.com';

-- ============================================
-- 2. Test the exact query from BuildingContext
-- ============================================

-- Replace 'USER_ID_HERE' with the actual user ID from above
SELECT 'BuildingContext Query Result:' as info;
SELECT 
    building_id,
    buildings.id,
    buildings.name
FROM admin_building_access
LEFT JOIN buildings ON buildings.id = admin_building_access.building_id
WHERE admin_id = 'USER_ID_HERE';  -- Replace with actual user ID

-- ============================================
-- 3. Test if the user is authenticated (auth.uid())
-- ============================================

SELECT 'Current Auth User:' as info;
SELECT auth.uid() as current_user_id;

-- ============================================
-- 4. Test the RLS policy
-- ============================================

-- This should work if RLS is working properly
SELECT 'RLS Test - Admin Building Access:' as info;
SELECT 
    building_id,
    buildings.id,
    buildings.name
FROM admin_building_access
LEFT JOIN buildings ON buildings.id = admin_building_access.building_id
WHERE admin_id = auth.uid();
