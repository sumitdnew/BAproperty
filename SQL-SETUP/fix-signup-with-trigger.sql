-- Better fix: Use database trigger to auto-create user profiles
-- This is more secure than disabling RLS

-- ============================================
-- 1. Create a function to handle new user creation
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into user_profiles table
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

-- ============================================
-- 2. Create trigger on auth.users
-- ============================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. Fix RLS policies for user_profiles
-- ============================================

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON user_profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON user_profiles;

-- Create policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow service role to do everything
CREATE POLICY "Service role can manage profiles" ON user_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 4. Grant permissions
-- ============================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_profiles TO authenticated;

-- ============================================
-- 5. Verify setup
-- ============================================

SELECT 'Trigger-based signup fix completed!' as result;
SELECT 'Now the user profile will be created automatically when a user signs up.' as note;
SELECT 'You can remove the manual profile creation from your signup code.' as instruction;
