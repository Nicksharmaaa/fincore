import React from 'react'
import { Navigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types/auth'
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react'

interface RouteGuardProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  requireEmployee?: boolean
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  allowedRoles,
  requireEmployee = true,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#142D4E] border-t-transparent animate-spin" />
          <p className="text-sm text-[#687788] font-medium font-sans">
            Verifying authentication & security permissions...
          </p>
        </div>
      </div>
    )
  }

  // Check login
  if (!isAuthenticated || !user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  // Strict check: Customers cannot access employee /app routes
  if (requireEmployee && user.role === 'customer') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB] p-6">
        <div className="max-w-md w-full bg-white rounded-xl border border-[#E2E8EF] p-8 shadow-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-[#FDF2F2] text-[#C44545] flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#182536] font-['Manrope'] mb-2">
            Restricted Employee Zone
          </h2>
          <p className="text-sm text-[#687788] mb-6 leading-relaxed">
            The internal workspace (<code className="text-xs bg-[#E9F1F5] px-1.5 py-0.5 rounded text-[#142D4E]">/app</code>)
            is strictly restricted to authorised insurance brokerage personnel. Customer accounts do not have CRM operational access.
          </p>
          <div className="flex flex-col gap-2">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#142D4E] text-white text-sm font-medium hover:bg-[#1D3D5C] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Customer Portal
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Role-based route authorization
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 bg-white rounded-xl border border-[#E2E8EF] shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#FDF7EE] text-[#C58A36] flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C58A36] bg-[#FDF7EE] px-2 py-0.5 rounded">
              Access Restricted
            </span>
            <h3 className="text-lg font-bold text-[#182536] font-['Manrope'] mt-1">
              Role Permission Required
            </h3>
            <p className="text-sm text-[#687788] mt-1.5 leading-relaxed">
              Your current profile role is <strong className="text-[#182536] uppercase">{user.role}</strong>.
              This operational module requires one of the following permissions:{' '}
              <span className="font-medium text-[#142D4E]">
                {allowedRoles.join(', ')}
              </span>.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link
                to="/app"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#142D4E] text-white text-xs font-medium hover:bg-[#1D3D5C] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Overview
              </Link>
              <span className="text-xs text-[#687788]">
                To switch roles for testing, use the user profile menu at the top right.
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
