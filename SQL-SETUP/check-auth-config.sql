-- Check Supabase Auth configuration
-- This helps identify why signup is returning 500 errors

-- Check auth configuration
SELECT 'Auth Configuration:' as info;
SELECT 
    key,
    value
FROM auth.config
ORDER BY key;

-- Check if signup is disabled
SELECT 'Signup Status:' as info;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.config WHERE key = 'DISABLE_SIGNUP' AND value = 'true') 
        THEN 'SIGNUP IS DISABLED - This is the problem!'
        ELSE 'Signup is enabled'
    END as signup_status;

-- Check email confirmation settings
SELECT 'Email Confirmation Status:' as info;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.config WHERE key = 'ENABLE_EMAIL_CONFIRMATIONS' AND value = 'true') 
        THEN 'Email confirmation is required'
        ELSE 'Email confirmation is disabled'
    END as email_confirmation_status;

-- Check site URL
SELECT 'Site URL:' as info;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.config WHERE key = 'SITE_URL') 
        THEN (SELECT value FROM auth.config WHERE key = 'SITE_URL')
        ELSE 'SITE_URL not configured'
    END as site_url;

