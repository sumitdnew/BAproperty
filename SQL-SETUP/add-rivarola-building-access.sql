-- Add Rivarola building access for Test Admin user
-- This will make Rivarola visible in the building dropdown

INSERT INTO admin_building_access (admin_id, building_id, access_level, can_manage_tenants, can_manage_payments, can_manage_maintenance) 
VALUES 
('8953d244-a921-45aa-8c0e-a6214d50edb5', 'd010604c-8e2d-4719-8e45-79f50ae0690f', 'full', true, true, true)
ON CONFLICT (admin_id, building_id) DO NOTHING;

-- If you want to give access to all admins, run these as well:

-- Ana Martínez
INSERT INTO admin_building_access (admin_id, building_id, access_level, can_manage_tenants, can_manage_payments, can_manage_maintenance) 
VALUES 
('a7ac335c-836f-4c91-b8c5-b0a80bf9cafe', 'd010604c-8e2d-4719-8e45-79f50ae0690f', 'full', true, true, true)
ON CONFLICT (admin_id, building_id) DO NOTHING;

-- Carlos Rodríguez
INSERT INTO admin_building_access (admin_id, building_id, access_level, can_manage_tenants, can_manage_payments, can_manage_maintenance) 
VALUES 
('ab85f2c0-0726-4121-b692-a72c82b2a504', 'd010604c-8e2d-4719-8e45-79f50ae0690f', 'full', true, true, true)
ON CONFLICT (admin_id, building_id) DO NOTHING;

-- Verify the access was added
SELECT 
  aba.admin_id,
  up.first_name || ' ' || up.last_name as admin_name,
  b.name as building_name
FROM admin_building_access aba
JOIN user_profiles up ON aba.admin_id = up.id
JOIN buildings b ON aba.building_id = b.id
WHERE b.name = 'Rivarola';

