# Admin Settings Feature - Setup Guide

## Overview
The Admin Settings feature allows administrators to configure application-wide settings including:
- Default Language (English/Spanish)
- Default Timezone
- Default Currency (ARS, USD, EUR, etc.)
- Date Format

## Database Setup

### 1. Create the App Settings Table

Run the SQL migration script to create the `app_settings` table:

```bash
# Execute the SQL file in your Supabase SQL Editor
SQL-SETUP/create-app-settings-table.sql
```

This will:
- Create the `app_settings` table
- Insert default settings
- Set up Row Level Security (RLS) policies
- Create necessary indexes

### Default Settings Created:
- `default_language`: 'en' (English)
- `default_timezone`: 'America/Argentina/Buenos_Aires'
- `default_currency`: 'ARS' (Argentine Peso)
- `supported_languages`: ["en", "es"]
- `supported_currencies`: ["ARS", "USD", "EUR"]
- `date_format`: 'DD/MM/YYYY'
- `currency_symbol`: '$'

## Access Control

### Permissions
- **Admin/Manager/Owner**: Can view and edit all settings
- **Tenants**: Can view public settings only (read-only)
- **Public Settings**: Settings with `is_public = true` can be read by all authenticated users

## Features

### Settings Page (`/settings`)

The settings page includes:

1. **Localization Settings**
   - Default Language selector (English/Spanish)
   - Timezone selector (major timezones worldwide)
   - Date format selector

2. **Currency Settings**
   - Currency selector (ARS, USD, EUR, GBP, JPY, BRL, MXN)
   - Automatic currency symbol update
   - Currency preview

3. **Actions**
   - Save button: Saves all settings to database
   - Reset button: Reverts to last saved values
   - Real-time validation and feedback

### Navigation

- Settings link appears in the top navigation bar for Admin/Manager users
- Uses gear icon (Cog6ToothIcon) for easy identification
- Not visible for tenant users

## Usage

### Accessing Settings

1. Log in as an Admin, Manager, or Owner
2. Click on "Settings" in the top navigation bar
3. Modify the desired settings
4. Click "Save Settings" to apply changes

### Language Changes

Language changes take effect immediately:
- The interface updates instantly
- The new language is saved to localStorage
- The setting is also saved to the database as the default for new users

### Currency Changes

When you change the currency:
- The currency code is updated
- The currency symbol is automatically updated based on the selected currency
- A preview shows how amounts will be displayed

## Technical Details

### Components

- **Settings Page**: `src/pages/Settings.tsx`
- **Header Navigation**: `src/components/Layout/Header.tsx`
- **Translations**: `src/lib/i18n.ts`

### Database Schema

```sql
CREATE TABLE app_settings (
  id UUID PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type VARCHAR(50) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  is_public BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Supported Timezones

- Buenos Aires (GMT-3)
- New York (GMT-5)
- Los Angeles (GMT-8)
- Chicago (GMT-6)
- Denver (GMT-7)
- Mexico City (GMT-6)
- São Paulo (GMT-3)
- London (GMT+0)
- Paris (GMT+1)
- Madrid (GMT+1)
- Tokyo (GMT+9)
- Shanghai (GMT+8)
- Sydney (GMT+10)

### Supported Currencies

| Code | Name | Symbol |
|------|------|--------|
| ARS | Argentine Peso | $ |
| USD | US Dollar | $ |
| EUR | Euro | € |
| GBP | British Pound | £ |
| JPY | Japanese Yen | ¥ |
| BRL | Brazilian Real | R$ |
| MXN | Mexican Peso | $ |

## Future Enhancements

Potential additions:
- Email notification settings
- Backup scheduling
- Theme customization (light/dark mode)
- Default page views
- Report generation settings
- Multi-currency support in transactions
- Custom date/time formats
- SMS notification settings
- Two-factor authentication settings

## Troubleshooting

### Settings Not Saving
1. Check that you're logged in as Admin/Manager/Owner
2. Verify the database table exists
3. Check browser console for errors
4. Verify RLS policies are correctly set up

### Settings Not Loading
1. Check that the `app_settings` table exists
2. Verify default settings were inserted
3. Check that RLS policies allow reading

### Language Not Changing
1. Clear browser cache
2. Check localStorage for `i18nextLng` key
3. Verify translation keys exist in `src/lib/i18n.ts`

## Security Notes

- All settings changes are logged with `updated_at` timestamp
- Only admin users can modify settings
- RLS policies prevent unauthorized access
- Settings are validated on both client and server side

