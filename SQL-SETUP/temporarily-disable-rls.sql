-- Temporarily disable RLS to test if that's causing the 406 errors
-- WARNING: This reduces security - only use for testing!

-- Disable RLS on user_profiles
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on tenants  
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;

-- Disable RLS on admin_building_access
ALTER TABLE admin_building_access DISABLE ROW LEVEL SECURITY;

-- Check the status
SELECT 'RLS Status After Disabling:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'tenants', 'admin_building_access')
ORDER BY tablename;


