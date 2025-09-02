import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation()

  const changeLanguage = async (lang: 'en' | 'es') => {
    try {
      console.log('Changing language to:', lang) // Debug log
      await i18n.changeLanguage(lang)
      console.log('Current language:', i18n.language) // Debug log
      
      // Ensure the language is saved to localStorage
      localStorage.setItem('i18nextLng', lang)
      sessionStorage.setItem('i18nextLng', lang)
    } catch (error) {
      console.error('Error changing language:', error)
    }
  }

  // Initialize with saved language on component mount
  useEffect(() => {
    const savedLang = localStorage.getItem('i18nextLng') || sessionStorage.getItem('i18nextLng')
    if (savedLang && savedLang !== i18n.language) {
      changeLanguage(savedLang as 'en' | 'es')
    }
  }, [])

  return (
    <div className="relative">
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value as 'en' | 'es')}
        className="appearance-none bg-white border border-blue-300 rounded-md px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent text-gray-700"
      >
        <option value="es">🇦🇷 Español</option>
        <option value="en">🇺🇸 English</option>
      </select>
    </div>
  )
}

export default LanguageSwitcher