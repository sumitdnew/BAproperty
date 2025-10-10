# Language-Based Email Templates - Feature Documentation

## Overview

The system now automatically selects the appropriate EmailJS template based on the configured language setting. When sending tenant invitation emails, the system will use:

- **English (en)**: `template_ln74jmx`
- **Spanish (es)**: `template_ijomj5y`

## How It Works

### 1. Database Configuration

Two new settings have been added to the `app_settings` table:

```sql
email_template_en = 'template_ln74jmx'  -- English template
email_template_es = 'template_ijomj5y'  -- Spanish template
```

### 2. Dynamic Template Selection

When sending an invitation email, the system:

1. Fetches the current `default_language` setting
2. Looks up the corresponding template: `email_template_${language}`
3. Uses that template ID in the EmailJS API call

### 3. Fallback Behavior

If the template settings cannot be loaded:
- Falls back to English template (`template_ln74jmx`)
- Logs a warning in the console
- Continues with email sending

## Admin Configuration

### Via Settings Page

Admins simply select the language in Settings:

1. Navigate to **Settings** in the admin navigation
2. Go to **Localization Settings** section
3. Select **Default Language** (English or Spanish)
4. Click **Save Settings**

The system automatically uses the appropriate email template based on the language setting. Admins don't need to configure template IDs - they're pre-configured in the database.

### Via Database (Advanced)

If you need to change the template IDs (for advanced users or developers), update directly in the database:

```sql
-- Update English template
UPDATE app_settings 
SET setting_value = 'your_template_id_here'
WHERE setting_key = 'email_template_en';

-- Update Spanish template
UPDATE app_settings 
SET setting_value = 'your_template_id_here'
WHERE setting_key = 'email_template_es';
```

## Email Template Variables

Both templates should support the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `to_email` | Recipient email address | `tenant@example.com` |
| `first_name` | Tenant's first name | `Juan` |
| `last_name` | Tenant's last name | `Pérez` |
| `user_email` | Same as to_email | `tenant@example.com` |
| `message` | Personal message from admin | `Welcome to Barrio!` |
| `building_name` | Building name | `Torre Norte` |
| `apartment_unit` | Apartment/unit number | `3A` |
| `temp_password` | Temporary password (if used) | `TempPass123!` |
| `login_url` | Login page URL | `https://app.com/login` |
| `signup_url` | Signup page URL with pre-filled email | `https://app.com/invite?email=...` |

## Code Implementation

### emailProvider.ts

The `sendViaEmailJS` method was updated to:

```typescript
// Get current language setting
const { data: langData } = await supabase
  .from('app_settings')
  .select('setting_value')
  .eq('setting_key', 'default_language')
  .single()

const currentLanguage = langData?.setting_value || 'en'

// Fetch appropriate template
const templateKey = `email_template_${currentLanguage}`
const { data: templateData } = await supabase
  .from('app_settings')
  .select('setting_value')
  .eq('setting_key', templateKey)
  .single()

const templateId = templateData?.setting_value || 'template_ln74jmx'
```

### Console Output

The system logs which template is being used:

```
📧 Using ES template: template_ijomj5y
📧 Language: es
```

## Testing

### Test English Template

1. Set language to English in Settings
2. Send a tenant invitation
3. Check console for: `📧 Using EN template: template_ln74jmx`
4. Verify email uses English template

### Test Spanish Template

1. Set language to Spanish in Settings
2. Send a tenant invitation
3. Check console for: `📧 Using ES template: template_ijomj5y`
4. Verify email uses Spanish template

### Manual Testing

```javascript
// In browser console
const { supabase } = await import('./src/lib/supabase')

// Check current settings
const { data } = await supabase
  .from('app_settings')
  .select('*')
  .in('setting_key', ['default_language', 'email_template_en', 'email_template_es'])

console.table(data)
```

## EmailJS Setup

### Creating Templates

For each language, create a template in EmailJS with:

1. **Template Name**: "Tenant Invitation - English" / "Tenant Invitation - Spanish"
2. **Subject**: Use appropriate language
3. **Content**: Use the HTML template provided earlier
4. **Variables**: Include all required variables listed above

### Template IDs

- Copy the template ID from EmailJS dashboard
- Format: `template_xxxxxxx`
- Update in Settings page or database

## Troubleshooting

### Email Sent in Wrong Language

**Symptoms**: Spanish users receive English emails (or vice versa)

**Solution**:
1. Check Settings page shows correct language
2. Verify template IDs are correct
3. Check console logs for template being used
4. Ensure EmailJS templates are properly configured

### Template Not Found Error

**Symptoms**: Email fails to send, error in console

**Solution**:
1. Verify template ID exists in EmailJS
2. Check template ID spelling (case-sensitive)
3. Ensure EmailJS service is active
4. Verify API keys are correct

### Fallback Template Used

**Symptoms**: Console shows "Could not fetch template from settings, using default"

**Solution**:
1. Check database connection
2. Verify `app_settings` table exists
3. Run database migration if needed
4. Check RLS policies allow reading

## Best Practices

### 1. Consistent Variables

Ensure both English and Spanish templates use the same variable names.

### 2. Testing

Test both templates after any changes:
- Create test invitations
- Verify email content
- Check all variables render correctly

### 3. Fallback Content

Always have fallback values in templates:
```
{{first_name}} or Resident
```

### 4. Version Control

Keep track of template IDs in documentation:
```
v1.0: template_ln74jmx (EN), template_ijomj5y (ES)
```

## Future Enhancements

Potential improvements:

- [ ] Per-user language preference
- [ ] Additional language support (Portuguese, etc.)
- [ ] Template preview in Settings page
- [ ] Template versioning
- [ ] A/B testing templates
- [ ] Email analytics
- [ ] Template customization per building
- [ ] Rich text editor for custom messages

## Related Files

- `SQL-SETUP/create-app-settings-table.sql` - Database setup
- `src/services/emailProvider.ts` - Email sending logic
- `src/pages/Settings.tsx` - Admin UI for configuration
- `src/lib/i18n.ts` - Translations for Settings page
- `docs/SETTINGS_SETUP.md` - General settings documentation

## Migration Path

### From Single Template

If you were using a single hardcoded template:

1. **Run SQL Migration**:
   ```bash
   # Execute create-app-settings-table.sql
   ```

2. **Update Template IDs**:
   - Go to Settings page
   - Enter your template IDs
   - Save changes

3. **Test**:
   - Send test invitations in both languages
   - Verify correct templates are used

### From External Configuration

If templates were configured elsewhere:

1. Import existing template IDs to settings
2. Update any external references
3. Remove old configuration
4. Test thoroughly

## Support

For issues or questions:

1. Check console logs for detailed error messages
2. Verify database settings
3. Test EmailJS connection
4. Review this documentation
5. Check Settings page configuration

---

**Version**: 1.0.0  
**Last Updated**: October 10, 2025  
**Status**: ✅ Production Ready

