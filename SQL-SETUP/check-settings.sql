-- Check current app settings
SELECT setting_key, setting_value, description 
FROM app_settings 
WHERE setting_key IN ('default_language', 'english_email_template_id', 'spanish_email_template_id')
ORDER BY setting_key;

-- If settings are missing, insert them:
-- Uncomment the section below and update with your actual template IDs

/*
INSERT INTO app_settings (setting_key, setting_value, description) VALUES
('default_language', 'es', 'Default language for the application'),
('spanish_email_template_id', 'YOUR_SPANISH_TEMPLATE_ID', 'EmailJS template ID for Spanish emails'),
('english_email_template_id', 'template_ln74jmx', 'EmailJS template ID for English emails')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;
*/

