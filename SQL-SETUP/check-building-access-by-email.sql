-- Check building access by email
-- Replace 'YOUR_EMAIL_HERE' with the email you're logged in with

-- Step 1: Find your user profile by email
SELECT 
    up.id as user_id,
    up.first_name || ' ' || up.last_name as full_name,
    up.user_type,
    up.email,
    up.created_at
FROM user_profiles up
WHERE up.email = 'YOUR_EMAIL_HERE'; -- Replace with your email

-- Step 2: Check which buildings this user has access to
SELECT 
    up.id as admin_id,
    up.first_name || ' ' || up.last_name as admin_name,
    up.email,
    b.id as building_id,
    b.name as building_name,
    aba.access_level,
    aba.can_manage_tenants,
    aba.can_manage_payments,
    aba.can_manage_maintenance
FROM user_profiles up
LEFT JOIN admin_building_access aba ON aba.admin_id = up.id
LEFT JOIN buildings b ON aba.building_id = b.id
WHERE up.email = 'YOUR_EMAIL_HERE' -- Replace with your email
ORDER BY b.name;

-- Step 3: List all buildings in the system
SELECT 
    id,
    name,
    address,
    city,
    total_apartments
FROM buildings
ORDER BY name;

-- Step 4: Count how many buildings this user has access to
SELECT 
    up.first_name || ' ' || up.last_name as admin_name,
    COUNT(aba.id) as buildings_with_access,
    (SELECT COUNT(*) FROM buildings) as total_buildings
FROM user_profiles up
LEFT JOIN admin_building_access aba ON aba.admin_id = up.id
WHERE up.email = 'YOUR_EMAIL_HERE' -- Replace with your email
GROUP BY up.id, up.first_name, up.last_name;

