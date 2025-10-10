import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface AppSettings {
  default_language: string
  default_timezone: string
  default_currency: string
  date_format: string
  currency_symbol: string
}

interface UseSettingsReturn {
  settings: AppSettings | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  getSetting: (key: keyof AppSettings) => string | undefined
}

/**
 * Custom hook to fetch and manage application settings
 * 
 * @example
 * const { settings, loading, error, getSetting } = useSettings()
 * const currency = getSetting('default_currency')
 */
export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'default_language',
          'default_timezone',
          'default_currency',
          'date_format',
          'currency_symbol',
        ])

      if (fetchError) throw fetchError

      if (data && data.length > 0) {
        const settingsObj: any = {
          default_language: 'en',
          default_timezone: 'America/Argentina/Buenos_Aires',
          default_currency: 'ARS',
          date_format: 'DD/MM/YYYY',
          currency_symbol: '$',
        }

        data.forEach((setting) => {
          settingsObj[setting.setting_key] = setting.setting_value
        })

        setSettings(settingsObj)
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err)
      setError(err.message || 'Failed to load settings')
      
      // Set default settings on error
      setSettings({
        default_language: 'en',
        default_timezone: 'America/Argentina/Buenos_Aires',
        default_currency: 'ARS',
        date_format: 'DD/MM/YYYY',
        currency_symbol: '$',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const getSetting = (key: keyof AppSettings): string | undefined => {
    return settings?.[key]
  }

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
    getSetting,
  }
}

/**
 * Hook to get a specific setting value
 * 
 * @param settingKey - The key of the setting to retrieve
 * @returns The setting value or undefined if not found
 * 
 * @example
 * const currency = useSetting('default_currency')
 */
export function useSetting(settingKey: string): string | undefined {
  const [value, setValue] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSetting = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('app_settings')
          .select('setting_value')
          .eq('setting_key', settingKey)
          .single()

        if (error) throw error
        if (data) setValue(data.setting_value)
      } catch (err) {
        console.error(`Error fetching setting ${settingKey}:`, err)
        setValue(undefined)
      } finally {
        setLoading(false)
      }
    }

    fetchSetting()
  }, [settingKey])

  return loading ? undefined : value
}

/**
 * Hook to format currency based on app settings
 * 
 * @returns A function to format amounts with the configured currency
 * 
 * @example
 * const formatCurrency = useCurrencyFormatter()
 * const formatted = formatCurrency(1000) // Returns: $1,000.00
 */
export function useCurrencyFormatter() {
  const { settings } = useSettings()

  const formatCurrency = (amount: number): string => {
    const symbol = settings?.currency_symbol || '$'
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
    
    return `${symbol}${formattedAmount}`
  }

  return formatCurrency
}

/**
 * Hook to format dates based on app settings
 * 
 * @returns A function to format dates with the configured format
 * 
 * @example
 * const formatDate = useDateFormatter()
 * const formatted = formatDate(new Date()) // Returns date in configured format
 */
export function useDateFormatter() {
  const { settings } = useSettings()

  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const format = settings?.date_format || 'DD/MM/YYYY'

    const day = String(dateObj.getDate()).padStart(2, '0')
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const year = dateObj.getFullYear()

    switch (format) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`
      case 'DD-MM-YYYY':
        return `${day}-${month}-${year}`
      default:
        return `${day}/${month}/${year}`
    }
  }

  return formatDate
}

