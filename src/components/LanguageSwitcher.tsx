import React from 'react'
import { useTranslation } from 'react-i18next'

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation()

  const changeLanguage = (lang: 'en' | 'es') => {
    console.log('Changing language to:', lang) // Debug log
    i18n.changeLanguage(lang)
    console.log('Current language:', i18n.language) // Debug log
  }

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