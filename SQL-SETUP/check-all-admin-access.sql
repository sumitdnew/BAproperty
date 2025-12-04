-- Check all admin users and their building access

-- ============================================
-- 1. Find all admin users
-- ============================================

SELECT 'All Admin Users:' as info;
SELECT 
    up.id as user_id,
    up.first_name || ' ' || up.last_name as full_name,
    up.email,
    up.user_type,
    up.created_at
FROM user_profiles up
WHERE up.user_type IN ('admin', 'property_manager', 'building_owner')
ORDER BY up.created_at DESC;

-- ============================================
-- 2. Check building access for each admin
-- ============================================

SELECT 'Building Access Summary:' as info;
SELECT 
    up.first_name || ' ' || up.last_name as admin_name,
    up.email,
    up.user_type,
    COUNT(aba.building_id) as buildings_with_access
FROM user_profiles up
LEFT JOIN admin_building_access aba ON aba.admin_id = up.id
WHERE up.user_type IN ('admin', 'property_manager', 'building_owner')
GROUP BY up.id, up.first_name, up.last_name, up.email, up.user_type
ORDER BY buildings_with_access DESC, up.created_at DESC;

-- ============================================
-- 3. Show detailed access for each admin
-- ============================================

SELECT 'Detailed Building Access:' as info;
SELECT 
    up.first_name || ' ' || up.last_name as admin_name,
    up.email,
    b.name as building_name,
    aba.access_level,
    aba.created_at as access_created
FROM user_profiles up
LEFT JOIN admin_building_access aba ON aba.admin_id = up.id
LEFT JOIN buildings b ON aba.building_id = b.id
WHERE up.user_type IN ('admin', 'property_manager', 'building_owner')
ORDER BY up.first_name, b.name;
