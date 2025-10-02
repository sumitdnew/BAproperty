-- Test script to verify tenant creation permissions
-- Run this to check if authenticated users can create tenant records

-- Check current RLS policies on tenants table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'tenants';

-- Test tenant creation with a dummy user_id (replace with actual user_id)
-- This will help identify if RLS is blocking tenant creation
DO $$
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000000'; -- Replace with actual user_id
    test_apartment_id UUID;
BEGIN
    -- Get a real apartment_id for testing
    SELECT id INTO test_apartment_id FROM apartments LIMIT 1;
    
    IF test_apartment_id IS NOT NULL THEN
        -- Try to create a test tenant record
        INSERT INTO tenants (
            user_id,
            apartment_id,
            dni,
            phone,
            emergency_contact_name,
            emergency_contact_phone,
            lease_start_date,
            lease_end_date,
            deposit_amount,
            is_active
        ) VALUES (
            test_user_id,
            test_apartment_id,
            'TEST123',
            '+1234567890',
            'Test Contact',
            '+1234567890',
            CURRENT_DATE,
            CURRENT_DATE + INTERVAL '1 year',
            1000.00,
            true
        );
        
        RAISE NOTICE 'Tenant creation test: SUCCESS';
        
        -- Clean up test record
        DELETE FROM tenants WHERE user_id = test_user_id;
        
    ELSE
        RAISE NOTICE 'No apartments found for testing';
    END IF;
END $$;

