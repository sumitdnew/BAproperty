-- Get the Test Admin user ID first

SELECT 'Test Admin User ID:' as info;
SELECT 
    up.id as user_id,
    up.first_name || ' ' || up.last_name as full_name,
    up.email,
    up.user_type
FROM user_profiles up
WHERE up.email = 'testadmin@ba-property.com';
