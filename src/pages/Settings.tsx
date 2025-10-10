import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { 
  Cog6ToothIcon as SettingsIcon, 
  GlobeAltIcon as Globe, 
  ClockIcon as Clock, 
  CurrencyDollarIcon as DollarSign, 
  CheckIcon as Save, 
  ArrowPathIcon as RefreshCw 
} from '@heroicons/react/24/outline'

interface AppSetting {
  id: string
  setting_key: string
  setting_value: string
  setting_type: string
  description: string
  category: string
}

interface SettingsForm {
  default_language: string
  default_timezone: string
  default_currency: string
  date_format: string
  currency_symbol: string
}

const TIMEZONES = [
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (GMT-3)' },
  { value: 'America/New_York', label: 'New York (GMT-5)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)' },
  { value: 'America/Chicago', label: 'Chicago (GMT-6)' },
  { value: 'America/Denver', label: 'Denver (GMT-7)' },
  { value: 'America/Mexico_City', label: 'Mexico City (GMT-6)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
  { value: 'Europe/London', label: 'London (GMT+0)' },
  { value: 'Europe/Paris', label: 'Paris (GMT+1)' },
  { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (GMT+8)' },
  { value: 'Australia/Sydney', label: 'Sydney (GMT+10)' },
]

const CURRENCIES = [
  { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
]

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2025)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2025)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2025-12-31)' },
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (31-12-2025)' },
]

export default function Settings() {
  const { t, i18n } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<SettingsForm>({
    default_language: 'en',
    default_timezone: 'America/Argentina/Buenos_Aires',
    default_currency: 'ARS',
    date_format: 'DD/MM/YYYY',
    currency_symbol: '$',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .in('setting_key', [
          'default_language',
          'default_timezone',
          'default_currency',
          'date_format',
          'currency_symbol',
        ])

      if (error) throw error

      if (data && data.length > 0) {
        const settingsObj: any = {}
        data.forEach((setting: AppSetting) => {
          settingsObj[setting.setting_key] = setting.setting_value
        })
        setSettings((prev) => ({ ...prev, ...settingsObj }))
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err)
      setError(err.message || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Update each setting
      const updates = Object.entries(settings).map(([key, value]) =>
        supabase
          .from('app_settings')
          .update({ 
            setting_value: value,
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', key)
      )

      const results = await Promise.all(updates)
      
      // Check for errors
      const hasError = results.some((result) => result.error)
      if (hasError) {
        throw new Error('Failed to update some settings')
      }

      // Update the current language if it changed
      if (settings.default_language !== i18n.language) {
        await i18n.changeLanguage(settings.default_language)
      }

      setSuccess('Settings saved successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Error saving settings:', err)
      setError(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    fetchSettings()
    setError(null)
    setSuccess(null)
  }

  const getCurrencySymbol = (currencyCode: string) => {
    const currency = CURRENCIES.find((c) => c.code === currencyCode)
    return currency?.symbol || '$'
  }

  const handleCurrencyChange = (currencyCode: string) => {
    const symbol = getCurrencySymbol(currencyCode)
    setSettings({
      ...settings,
      default_currency: currencyCode,
      currency_symbol: symbol,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="h-8 w-8 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-900">{t('settings')}</h1>
        </div>
        <p className="text-gray-600">{t('configureApplicationSettings')}</p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Localization Settings */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900">{t('localizationSettings')}</h2>
          </div>

          <div className="space-y-4">
            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('defaultLanguage')}
              </label>
              <select
                value={settings.default_language}
                onChange={(e) => setSettings({ ...settings, default_language: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="es">Español (Spanish)</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">{t('defaultLanguageDescription')}</p>
              <p className="mt-1 text-xs text-blue-600">
                💡 {t('languageAffectsEmails')}
              </p>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                {t('defaultTimezone')}
              </label>
              <select
                value={settings.default_timezone}
                onChange={(e) => setSettings({ ...settings, default_timezone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">{t('defaultTimezoneDescription')}</p>
            </div>

            {/* Date Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('dateFormat')}
              </label>
              <select
                value={settings.date_format}
                onChange={(e) => setSettings({ ...settings, date_format: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {DATE_FORMATS.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">{t('dateFormatDescription')}</p>
            </div>
          </div>
        </div>

        {/* Currency Settings */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900">{t('currencySettings')}</h2>
          </div>

          <div className="space-y-4">
            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('defaultCurrency')}
              </label>
              <select
                value={settings.default_currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name} ({currency.symbol})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">{t('defaultCurrencyDescription')}</p>
            </div>

            {/* Currency Symbol Preview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">{t('currencyPreview')}:</p>
              <p className="text-2xl font-bold text-gray-900">
                {settings.currency_symbol}1,000.00
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-gray-50 rounded-b-lg flex justify-between">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t('reset')}
          </button>
          
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {t('saving')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t('saveSettings')}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Information Panel */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">{t('note')}</h3>
        <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
          <li>{t('settingsApplyGlobally')}</li>
          <li>{t('usersCanOverrideSettings')}</li>
          <li>{t('languageChangeImmediate')}</li>
          <li>{t('languageAffectsEmails')}</li>
          <li>{t('timezoneAffectsDisplay')}</li>
        </ul>
      </div>
    </div>
  )
}

