-- Test the exact query that BuildingContext uses for Test Admin

-- ============================================
-- 1. Test the exact BuildingContext query
-- ============================================

SELECT 'BuildingContext Query Result:' as info;
SELECT 
    building_id,
    buildings.id,
    buildings.name
FROM admin_building_access
LEFT JOIN buildings ON buildings.id = admin_building_access.building_id
WHERE admin_id = '8953d244-a921-45aa-8c0e-a6214d50edb5';

-- ============================================
-- 2. Test if RLS is working (this should work if user is authenticated)
-- ============================================

SELECT 'RLS Test - Current User Access:' as info;
SELECT 
    building_id,
    buildings.id,
    buildings.name
FROM admin_building_access
LEFT JOIN buildings ON buildings.id = admin_building_access.building_id
WHERE admin_id = auth.uid();

-- ============================================
-- 3. Check if the user is properly authenticated
-- ============================================

SELECT 'Current Auth User:' as info;
SELECT auth.uid() as current_user_id;

-- ============================================
-- 4. Test the query with different syntax
-- ============================================

SELECT 'Alternative Query Syntax:' as info;
SELECT 
    aba.building_id,
    b.id,
    b.name
FROM admin_building_access aba
LEFT JOIN buildings b ON b.id = aba.building_id
WHERE aba.admin_id = '8953d244-a921-45aa-8c0e-a6214d50edb5';
