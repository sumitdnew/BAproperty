-- Add Email Template IDs to app_settings
-- English template: template_ln74jmx
-- Spanish template: template_ijomj5y

INSERT INTO app_settings (setting_key, setting_value, setting_type, description, category, is_public) VALUES
('english_email_template_id', 'template_ln74jmx', 'string', 'EmailJS template ID for English tenant invitation emails', 'email', true),
('spanish_email_template_id', 'template_ijomj5y', 'string', 'EmailJS template ID for Spanish tenant invitation emails', 'email', true)
ON CONFLICT (setting_key) DO UPDATE 
SET setting_value = EXCLUDED.setting_value,
    description = EXCLUDED.description;

-- Verify the settings were added
SELECT setting_key, setting_value, description 
FROM app_settings 
WHERE setting_key IN ('default_language', 'english_email_template_id', 'spanish_email_template_id')
ORDER BY setting_key;

