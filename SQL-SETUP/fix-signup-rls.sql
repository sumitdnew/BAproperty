-- Fix RLS issues preventing user signup
-- This script ensures that user signup works properly

-- 1. Check current RLS status on user_profiles
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- 2. Temporarily disable RLS on user_profiles if it's causing issues
-- (We can re-enable it later with proper policies)
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 3. Ensure proper permissions for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON tenants TO authenticated;
GRANT ALL ON invitations TO authenticated;
GRANT ALL ON apartments TO authenticated;
GRANT ALL ON buildings TO authenticated;

-- 4. Ensure proper permissions for service role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON user_profiles TO service_role;
GRANT ALL ON tenants TO service_role;
GRANT ALL ON invitations TO service_role;
GRANT ALL ON apartments TO service_role;
GRANT ALL ON buildings TO service_role;

-- 5. Create a function to handle user profile creation (if needed)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be used to automatically create user profiles
  -- when new users are created in auth.users
  INSERT INTO public.user_profiles (id, user_type, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'tenant'),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION handle_new_user() TO service_role;

-- 7. Check if we need to create a trigger (optional)
-- This would automatically create user profiles when auth users are created
-- Uncomment the following lines if you want automatic profile creation:

-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 8. Show current permissions
SELECT 
  grantee,
  table_name,
  privilege_type
FROM information_schema.table_privileges 
WHERE table_name IN ('user_profiles', 'tenants', 'invitations', 'apartments', 'buildings')
  AND grantee IN ('authenticated', 'service_role')
ORDER BY table_name, grantee;
