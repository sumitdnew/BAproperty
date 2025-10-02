-- Fix RLS policies for user_profiles table
-- This script ensures that user profiles can be created and managed properly

-- Check if RLS is enabled on user_profiles table
-- If RLS is enabled but no policies exist, it will block all operations

-- First, let's create policies for user_profiles table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "System can update profiles" ON user_profiles;

-- Create policies for user_profiles table
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() 
      AND up.user_type IN ('admin', 'property_manager', 'building_owner')
    )
  );

-- Allow system operations (for invitation process)
CREATE POLICY "System can insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update profiles" ON user_profiles
  FOR UPDATE USING (true);

-- Enable RLS on user_profiles table if not already enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Also ensure RLS is properly configured for other related tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = user_id 
    AND user_type IN ('admin', 'property_manager', 'building_owner')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON tenants TO authenticated;
GRANT ALL ON invitations TO authenticated;

