import React from 'react'
import { Link } from 'react-router-dom'

interface LogoProps {
  variant?: 'light' | 'dark'
  withTagline?: boolean
  className?: string
  to?: string
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'dark',
  withTagline = false,
  className = '',
  to = '/',
}) => {
  const isLight = variant === 'light'

  return (
    <Link to={to} className={`inline-flex items-center gap-2.5 no-underline group ${className}`}>
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm tracking-wider shadow-sm transition-transform group-hover:scale-105"
        style={{
          backgroundColor: '#16856D',
          color: '#FFFFFF',
          fontFamily: "'Manrope', sans-serif",
        }}
      >
        FC
      </div>
      <div className="flex flex-col">
        <span
          className="text-base font-extrabold tracking-tight leading-none"
          style={{
            color: isLight ? '#FFFFFF' : '#142D4E',
            fontFamily: "'Manrope', sans-serif",
          }}
        >
          FINCORE
        </span>
        {withTagline && (
          <span
            className="text-[10px] tracking-normal mt-0.5"
            style={{
              color: isLight ? 'rgba(255,255,255,0.7)' : '#687788',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Intelligent Insurance
          </span>
        )}
      </div>
    </Link>
  )
}
