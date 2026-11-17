import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import type { UserRole } from '../../../types/auth'
import { Logo } from '../../../components/shared/Logo'
import { ShieldCheck, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react'

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const redirectUrl = searchParams.get('redirect') || '/app'
  const navigate = useNavigate()
  const { login } = useAuth()

  const [activeTab, setActiveTab] = useState<'employee' | 'customer'>('employee')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (activeTab === 'employee') {
      login('sales', email)
      navigate(redirectUrl)
    } else {
      login('customer', email)
      navigate('/')
    }
  }

  const handleQuickRoleLogin = (role: UserRole) => {
    login(role)
    if (role === 'customer') {
      navigate('/')
    } else {
      navigate(redirectUrl.startsWith('/app') ? redirectUrl : '/app')
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#E2E8EF] p-8 shadow-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Logo withTagline={true} />
          </div>
          <h1 className="text-xl font-bold text-[#142D4E] font-['Manrope'] mt-4">
            Sign in to FINCORE
          </h1>
          <p className="text-xs text-[#687788]">
            Authorised Life Insurance Brokerage Platform
          </p>
        </div>

        {/* Tab Switcher: Employee CRM vs Customer Account */}
        <div className="flex border-b border-[#E2E8EF] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('employee')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
              activeTab === 'employee'
                ? 'border-[#142D4E] text-[#142D4E]'
                : 'border-transparent text-[#687788] hover:text-[#182536]'
            }`}
          >
            Employee Workspace
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('customer')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
              activeTab === 'customer'
                ? 'border-[#142D4E] text-[#142D4E]'
                : 'border-transparent text-[#687788] hover:text-[#182536]'
            }`}
          >
            Customer Portal
          </button>
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleCustomLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#182536] mb-1">
              {activeTab === 'employee' ? 'Official Work Email' : 'Email Address'}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                activeTab === 'employee'
                  ? 'agent.name@fincore.in'
                  : 'customer@example.com'
              }
              className="w-full h-9 px-3 rounded-lg border border-[#E2E8EF] bg-white text-[#182536] focus:outline-none focus:border-[#142D4E]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-[#182536]">Password</label>
              <a href="#forgot" className="text-[11px] text-[#16856D] hover:underline">
                Forgot?
              </a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-9 px-3 rounded-lg border border-[#E2E8EF] bg-white text-[#182536] focus:outline-none focus:border-[#142D4E]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white font-semibold transition-colors shadow-xs"
          >
            Sign in as {activeTab === 'employee' ? 'Employee' : 'Customer'}
          </button>
        </form>

        {/* One-Click Quick Role Login for Testing Route Guards */}
        <div className="pt-4 border-t border-[#E2E8EF] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#687788]">
              Quick Demo Access by Role
            </span>
            <span className="text-[10px] text-[#16856D] font-medium">Evaluation mode</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickRoleLogin('sales')}
              className="p-2 rounded-lg border border-[#E2E8EF] hover:border-[#142D4E] bg-[#F7F9FB] hover:bg-white text-left transition-all"
            >
              <span className="font-bold text-[#142D4E] block">Sales Advisor</span>
              <span className="text-[10px] text-[#687788]">Amit Kumar</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickRoleLogin('manager')}
              className="p-2 rounded-lg border border-[#E2E8EF] hover:border-[#142D4E] bg-[#F7F9FB] hover:bg-white text-left transition-all"
            >
              <span className="font-bold text-[#142D4E] block">Sales Manager</span>
              <span className="text-[10px] text-[#687788]">Priya Sen</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickRoleLogin('admin')}
              className="p-2 rounded-lg border border-[#E2E8EF] hover:border-[#142D4E] bg-[#F7F9FB] hover:bg-white text-left transition-all"
            >
              <span className="font-bold text-[#142D4E] block">Admin</span>
              <span className="text-[10px] text-[#687788]">Vikram Malhotra</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickRoleLogin('operations')}
              className="p-2 rounded-lg border border-[#E2E8EF] hover:border-[#142D4E] bg-[#F7F9FB] hover:bg-white text-left transition-all"
            >
              <span className="font-bold text-[#142D4E] block">Operations</span>
              <span className="text-[10px] text-[#687788]">Sneha Reddy</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickRoleLogin('finance')}
              className="p-2 rounded-lg border border-[#E2E8EF] hover:border-[#142D4E] bg-[#F7F9FB] hover:bg-white text-left transition-all"
            >
              <span className="font-bold text-[#142D4E] block">Finance</span>
              <span className="text-[10px] text-[#687788]">Rajiv Mehta</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickRoleLogin('compliance')}
              className="p-2 rounded-lg border border-[#E2E8EF] hover:border-[#142D4E] bg-[#F7F9FB] hover:bg-white text-left transition-all"
            >
              <span className="font-bold text-[#142D4E] block">Compliance</span>
              <span className="text-[10px] text-[#687788]">Kavita Nair</span>
            </button>
          </div>
        </div>

        {/* Link to Register */}
        <div className="pt-2 text-center text-xs text-[#687788]">
          <span>Don’t have a customer account? </span>
          <Link to="/register" className="text-[#142D4E] font-bold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  )
}
