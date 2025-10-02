-- Fix RLS policies for tenants table to allow proper tenant creation during signup

-- First, let's check current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'tenants';

-- Check existing policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'tenants';

-- Drop existing problematic policies (if any)
DROP POLICY IF EXISTS "Users can view own tenant data" ON tenants;
DROP POLICY IF EXISTS "Users can update own tenant data" ON tenants;
DROP POLICY IF EXISTS "Users can insert own tenant data" ON tenants;
DROP POLICY IF EXISTS "Admins can manage all tenants" ON tenants;

-- Enable RLS on tenants table
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Create new policies that work properly

-- 1. Allow authenticated users to insert their own tenant records
CREATE POLICY "Authenticated users can insert own tenant records" ON tenants
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 2. Allow authenticated users to view their own tenant data
CREATE POLICY "Users can view own tenant data" ON tenants
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 3. Allow authenticated users to update their own tenant data
CREATE POLICY "Users can update own tenant data" ON tenants
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Allow admins/property managers to manage all tenants
CREATE POLICY "Admins can manage all tenants" ON tenants
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND user_type IN ('admin', 'property_manager', 'building_owner')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND user_type IN ('admin', 'property_manager', 'building_owner')
        )
    );

-- Verify the new policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'tenants'
ORDER BY policyname;

