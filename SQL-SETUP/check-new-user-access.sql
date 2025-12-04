-- Check what buildings the new user should have access to

-- ============================================
-- 1. Find the new user you just created
-- ============================================

SELECT 'Recent Users:' as info;
SELECT 
    up.id as user_id,
    up.first_name || ' ' || up.last_name as full_name,
    up.email,
    up.user_type,
    up.created_at
FROM user_profiles up
ORDER BY up.created_at DESC
LIMIT 5;

-- ============================================
-- 2. Check if this user has any building access
-- ============================================

-- Replace 'USER_ID_HERE' with the actual user ID from above
SELECT 'Building Access for New User:' as info;
SELECT 
    up.first_name || ' ' || up.last_name as admin_name,
    up.email,
    b.name as building_name,
    aba.access_level
FROM user_profiles up
LEFT JOIN admin_building_access aba ON aba.admin_id = up.id
LEFT JOIN buildings b ON aba.building_id = b.id
WHERE up.created_at > NOW() - INTERVAL '1 hour'  -- Users created in last hour
ORDER BY up.created_at DESC;

-- ============================================
-- 3. List all buildings
-- ============================================

SELECT 'All Buildings:' as info;
SELECT id, name FROM buildings ORDER BY name;
