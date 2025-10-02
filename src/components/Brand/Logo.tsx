import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showWordmark?: boolean
  pinColor?: string
  textColor?: string
}

const sizeToClasses: Record<string, { text: string; icon: string }> = {
  sm: { text: 'text-lg', icon: 'w-5 h-5' },
  md: { text: 'text-2xl', icon: 'w-6 h-6' },
  lg: { text: 'text-3xl', icon: 'w-8 h-8' }
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showWordmark = true, pinColor = '#FF385C', textColor = '#1F2937' }) => {
  const s = sizeToClasses[size]
  return (
    <div className="flex items-center" aria-label="Barrio">
      {showWordmark && (
        <span className={`${s.text} font-bold tracking-tight`} style={{ color: textColor }}>Barr</span>
      )}
      <svg
        className={`${s.icon} mx-0.5`}
        viewBox="0 0 24 24"
        fill={pinColor}
        aria-hidden="true"
      >
        <path d="M12 2C7.864 2 4.5 5.364 4.5 9.5c0 5.25 6.6 11.7 7.13 12.2.2.19.54.19.75 0 .53-.5 7.12-6.95 7.12-12.2C19.5 5.364 16.136 2 12 2zm0 11.25a3.75 3.75 0 1 1 0-7.5 3.75 3.75 0 0 1 0 7.5z"/>
      </svg>
      {showWordmark && (
        <span className={`${s.text} font-bold tracking-tight`} style={{ color: textColor }}>io</span>
      )}
    </div>
  )
}

export default Logo


