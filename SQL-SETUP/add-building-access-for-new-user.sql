-- Add building access for the new user
-- Replace 'NEW_USER_ID' with the actual user ID from the check script

-- ============================================
-- Option 1: Give access to ALL buildings (like Test Admin)
-- ============================================

-- Replace 'NEW_USER_ID' with the actual user ID
INSERT INTO admin_building_access (admin_id, building_id, access_level, can_manage_tenants, can_manage_payments, can_manage_maintenance) 
SELECT 
    'NEW_USER_ID' as admin_id,  -- Replace with actual user ID
    b.id as building_id,
    'full' as access_level,
    true as can_manage_tenants,
    true as can_manage_payments,
    true as can_manage_maintenance
FROM buildings b
ON CONFLICT (admin_id, building_id) DO NOTHING;

-- ============================================
-- Option 2: Give access to specific buildings only
-- ============================================

-- Uncomment and modify this section if you want to give access to specific buildings only
/*
-- Replace 'NEW_USER_ID' with the actual user ID
-- Replace 'BUILDING_ID_1' and 'BUILDING_ID_2' with actual building IDs

INSERT INTO admin_building_access (admin_id, building_id, access_level, can_manage_tenants, can_manage_payments, can_manage_maintenance) 
VALUES 
('NEW_USER_ID', 'BUILDING_ID_1', 'full', true, true, true),
('NEW_USER_ID', 'BUILDING_ID_2', 'full', true, true, true)
ON CONFLICT (admin_id, building_id) DO NOTHING;
*/

-- ============================================
-- Verify the access was added
-- ============================================

SELECT 'Building Access Added:' as info;
SELECT 
    up.first_name || ' ' || up.last_name as admin_name,
    up.email,
    b.name as building_name,
    aba.access_level
FROM user_profiles up
JOIN admin_building_access aba ON aba.admin_id = up.id
JOIN buildings b ON aba.building_id = b.id
WHERE up.id = 'NEW_USER_ID'  -- Replace with actual user ID
ORDER BY b.name;


