-- Check building access for the current user (sumit.cmu@gmail.com)

-- ============================================
-- 1. Find the current user
-- ============================================

SELECT 'Current User Info:' as info;
SELECT 
    up.id as user_id,
    up.first_name || ' ' || up.last_name as full_name,
    up.email,
    up.user_type,
    up.created_at
FROM user_profiles up
WHERE up.email = 'sumit.cmu@gmail.com';

-- ============================================
-- 2. Check building access for this user
-- ============================================

-- Replace 'USER_ID_HERE' with the actual user ID from above
SELECT 'Building Access for Current User:' as info;
SELECT 
    building_id,
    buildings.id,
    buildings.name,
    access_level
FROM admin_building_access
LEFT JOIN buildings ON buildings.id = admin_building_access.building_id
WHERE admin_id = 'USER_ID_HERE';  -- Replace with actual user ID

-- ============================================
-- 3. Check if this user has any access records at all
-- ============================================

SELECT 'All Access Records for Current User:' as info;
SELECT COUNT(*) as total_access_records
FROM admin_building_access
WHERE admin_id = 'USER_ID_HERE';  -- Replace with actual user ID
