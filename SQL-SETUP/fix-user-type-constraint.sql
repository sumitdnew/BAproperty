-- Script to fix user_type constraint in user_profiles table

-- First, let's drop the existing constraint (if it exists)
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_type_check;

-- Now add a new constraint that allows our desired user types
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_user_type_check 
CHECK (user_type IN ('admin', 'owner', 'tenant', 'property-manager', 'building-owner'));

-- Alternative: If you want to be more flexible, you can use a pattern match
-- ALTER TABLE user_profiles 
-- ADD CONSTRAINT user_profiles_user_type_check 
-- CHECK (user_type ~ '^(admin|owner|tenant|property-manager|building-owner)$');

-- Verify the constraint was added
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'user_profiles'::regclass 
AND conname = 'user_profiles_user_type_check';
