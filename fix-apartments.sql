-- Fix apartments that were incorrectly marked as occupied
-- Run this in your Supabase SQL Editor to reset apartments back to available

-- First, let's see which apartments are marked as occupied but don't have active tenants
SELECT 
    a.id,
    a.unit_number,
    a.building_id,
    a.is_occupied,
    b.name as building_name,
    t.id as tenant_id,
    t.is_active
FROM apartments a
LEFT JOIN buildings b ON a.building_id = b.id
LEFT JOIN tenants t ON a.id = t.apartment_id AND t.is_active = true
WHERE a.is_occupied = true
ORDER BY b.name, a.unit_number;

-- Reset apartments that are marked as occupied but have no active tenants
UPDATE apartments 
SET is_occupied = false
WHERE id IN (
    SELECT a.id 
    FROM apartments a
    LEFT JOIN tenants t ON a.id = t.apartment_id AND t.is_active = true
    WHERE a.is_occupied = true AND t.id IS NULL
);

-- Show the result
SELECT 
    a.id,
    a.unit_number,
    a.building_id,
    a.is_occupied,
    b.name as building_name
FROM apartments a
LEFT JOIN buildings b ON a.building_id = b.id
WHERE a.is_occupied = false
ORDER BY b.name, a.unit_number;



