-- Fix apartment occupancy status
-- This script unmarks apartments that were incorrectly marked as occupied during invitation process
-- but where the user hasn't actually signed up yet

-- First, let's see what we're working with
SELECT 
  a.id as apartment_id,
  a.unit_number,
  a.is_occupied,
  t.id as tenant_id,
  t.user_id,
  t.is_active,
  i.id as invitation_id,
  i.status as invitation_status,
  i.email
FROM apartments a
LEFT JOIN tenants t ON a.id = t.apartment_id
LEFT JOIN invitations i ON t.apartment_id = i.apartment_id
WHERE a.is_occupied = true
ORDER BY a.unit_number;

-- Now fix the apartments that should NOT be occupied
-- These are apartments where:
-- 1. The apartment is marked as occupied
-- 2. The tenant record has user_id = null (no actual user linked)
-- 3. The invitation is still 'sent' (not accepted)

UPDATE apartments 
SET is_occupied = false
WHERE id IN (
  SELECT DISTINCT a.id
  FROM apartments a
  JOIN tenants t ON a.id = t.apartment_id
  JOIN invitations i ON t.apartment_id = i.apartment_id
  WHERE a.is_occupied = true
    AND t.user_id IS NULL
    AND i.status = 'sent'
);

-- Let's also clean up any orphaned tenant records
-- (tenant records with no corresponding invitation)
DELETE FROM tenants 
WHERE id IN (
  SELECT t.id
  FROM tenants t
  LEFT JOIN invitations i ON t.apartment_id = i.apartment_id
  WHERE t.user_id IS NULL
    AND i.id IS NULL
);

-- Show the results after the fix
SELECT 
  a.id as apartment_id,
  a.unit_number,
  a.is_occupied,
  t.id as tenant_id,
  t.user_id,
  t.is_active,
  i.id as invitation_id,
  i.status as invitation_status,
  i.email
FROM apartments a
LEFT JOIN tenants t ON a.id = t.apartment_id
LEFT JOIN invitations i ON t.apartment_id = i.apartment_id
WHERE a.is_occupied = true
ORDER BY a.unit_number;

-- Show summary
SELECT 
  'Apartments marked as occupied' as status,
  COUNT(*) as count
FROM apartments 
WHERE is_occupied = true

UNION ALL

SELECT 
  'Apartments available' as status,
  COUNT(*) as count
FROM apartments 
WHERE is_occupied = false

UNION ALL

SELECT 
  'Pending invitations' as status,
  COUNT(*) as count
FROM invitations 
WHERE status = 'sent'

UNION ALL

SELECT 
  'Accepted invitations' as status,
  COUNT(*) as count
FROM invitations 
WHERE status = 'accepted';
