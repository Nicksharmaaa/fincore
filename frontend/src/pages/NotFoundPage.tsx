import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Logo } from '../components/shared/Logo'
import { ArrowLeft, Home, LayoutDashboard } from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  const location = useLocation()
  const isAppRoute = location.pathname.startsWith('/app')

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB] p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#E2E8EF] p-8 shadow-sm space-y-6">
        <div className="flex justify-center">
          <Logo withTagline={true} />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-extrabold text-[#142D4E] font-['Manrope'] block">
            404
          </span>
          <h1 className="text-xl font-bold text-[#182536] font-['Manrope']">
            Page or Module Not Found
          </h1>
          <p className="text-xs text-[#687788] leading-relaxed">
            The path <code className="bg-[#E9F1F5] px-1.5 py-0.5 rounded text-[#142D4E]">{location.pathname}</code> does not exist on the FINCORE platform.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Link
            to="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#E2E8EF] hover:border-[#142D4E] text-[#142D4E] text-xs font-semibold transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Public Home</span>
          </Link>

          <Link
            to="/app"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white text-xs font-semibold transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>CRM Workspace</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
