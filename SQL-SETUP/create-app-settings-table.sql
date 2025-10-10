-- Create App Settings Table
-- This table stores system-wide configuration settings

CREATE TABLE IF NOT EXISTS app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type VARCHAR(50) NOT NULL, -- 'string', 'number', 'boolean', 'json'
  description TEXT,
  category VARCHAR(50), -- 'general', 'localization', 'currency', 'notifications', etc.
  is_public BOOLEAN DEFAULT FALSE, -- If true, setting can be accessed by all users
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO app_settings (setting_key, setting_value, setting_type, description, category, is_public)
VALUES 
  ('default_language', 'en', 'string', 'Default application language', 'localization', true),
  ('default_timezone', 'America/Argentina/Buenos_Aires', 'string', 'Default timezone for the application', 'localization', true),
  ('default_currency', 'ARS', 'string', 'Default currency for payments and transactions', 'currency', true),
  ('supported_languages', '["en", "es"]', 'json', 'List of supported languages', 'localization', true),
  ('supported_currencies', '["ARS", "USD", "EUR"]', 'json', 'List of supported currencies', 'currency', true),
  ('date_format', 'DD/MM/YYYY', 'string', 'Default date format', 'localization', true),
  ('currency_symbol', '$', 'string', 'Default currency symbol', 'currency', true),
  ('email_template_en', 'template_ln74jmx', 'string', 'EmailJS template ID for English tenant invitations', 'email', true),
  ('email_template_es', 'template_ijomj5y', 'string', 'EmailJS template ID for Spanish tenant invitations', 'email', true)
ON CONFLICT (setting_key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_app_settings_category ON app_settings(category);

-- Enable Row Level Security (RLS)
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Public settings can be read by everyone
CREATE POLICY "Public settings are viewable by everyone"
  ON app_settings FOR SELECT
  USING (is_public = true);

-- Policy: Admin users can view all settings
CREATE POLICY "Admin users can view all settings"
  ON app_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type IN ('admin', 'owner', 'manager')
    )
  );

-- Policy: Admin users can insert settings
CREATE POLICY "Admin users can insert settings"
  ON app_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type IN ('admin', 'owner', 'manager')
    )
  );

-- Policy: Admin users can update settings
CREATE POLICY "Admin users can update settings"
  ON app_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type IN ('admin', 'owner', 'manager')
    )
  );

-- Policy: Admin users can delete settings
CREATE POLICY "Admin users can delete settings"
  ON app_settings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type IN ('admin', 'owner', 'manager')
    )
  );

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_app_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_app_settings_timestamp
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_app_settings_updated_at();

