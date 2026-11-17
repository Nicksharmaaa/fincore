import React, { useState, useRef, useEffect } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../types/auth'
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  UserCheck,
  LogOut,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { SalesCopilotDrawer } from '../../portals/employee/components/SalesCopilotDrawer'

interface AppTopNavProps {
  onOpenMobileSidebar: () => void
}

const NOTIFICATIONS = [
  {
    id: 1,
    title: 'High-Value Lead Assigned',
    desc: 'Rajesh Verma (₹1 Cr Term cover interest) assigned to your queue.',
    time: '12m ago',
    unread: true,
  },
  {
    id: 2,
    title: 'Document Approved by Operations',
    desc: 'PAN card verified for Application #APP-9082 (Ananya Iyer).',
    time: '1h ago',
    unread: true,
  },
  {
    id: 3,
    title: 'Follow-up Reminder',
    desc: 'Call scheduled with Suresh Patel regarding HDFC Life comparison quote.',
    time: '3h ago',
    unread: false,
  },
]

export const AppTopNav: React.FC<AppTopNavProps> = ({ onOpenMobileSidebar }) => {
  const { user, logout, switchRole } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [roleSwitchOpen, setRoleSwitchOpen] = useState(false)
  const [copilotOpen, setCopilotOpen] = useState(false)

  const profileRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
        setRoleSwitchOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Build breadcrumb segments
  const pathParts = location.pathname.split('/').filter(Boolean)
  // e.g. ['app', 'leads'] -> Breadcrumbs: Workspace > Leads
  const breadcrumbItems = pathParts.map((part, index) => {
    const url = `/${pathParts.slice(0, index + 1).join('/')}`
    const label =
      part === 'app'
        ? 'Workspace'
        : part.charAt(0).toUpperCase() + part.slice(1)
    return { label, url, isLast: index === pathParts.length - 1 }
  })

  const availableRoles: Array<{ role: UserRole; title: string; desc: string }> = [
    { role: 'sales', title: 'Sales & Advisory', desc: 'Leads, quotes, customer interactions' },
    { role: 'manager', title: 'Sales Manager', desc: 'Team lead distribution, analytics' },
    { role: 'admin', title: 'Administrator', desc: 'Complete system & user configuration' },
    { role: 'operations', title: 'Policy Operations', desc: 'Doc verification & insurer proposal flow' },
    { role: 'finance', title: 'Brokerage Finance', desc: 'Commission tracking & revenue stats' },
    { role: 'compliance', title: 'IRDAI Compliance', desc: 'Needs assessment & audit oversight' },
    { role: 'customer', title: 'Retail Customer', desc: 'Testing customer access restriction guard' },
  ]

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role)
    setRoleSwitchOpen(false)
    setProfileOpen(false)
    if (role === 'customer') {
      navigate('/')
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    // Navigate or filter
    navigate(`/app/leads?q=${encodeURIComponent(searchQuery)}`)
  }

  return (
    <header
      className="h-16 bg-white border-b border-[#E2E8EF] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-[#687788] hover:text-[#182536] hover:bg-[#E9F1F5]"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center text-xs text-[#687788]">
          <Link
            to="/app"
            className="hover:text-[#142D4E] font-medium transition-colors"
          >
            Fincore CRM
          </Link>
          {breadcrumbItems.map((crumb) => (
            <React.Fragment key={crumb.url}>
              <span className="mx-2 text-[#E2E8EF]">/</span>
              {crumb.isLast ? (
                <span className="text-[#182536] font-semibold">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.url}
                  className="hover:text-[#142D4E] transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Center: Global Search */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-[#687788] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads, customers, policy ref, PAN..."
            className="w-full h-9 pl-9 pr-14 text-xs rounded-lg border border-[#E2E8EF] bg-[#F7F9FB] focus:bg-white focus:border-[#142D4E] focus:outline-none transition-all placeholder:text-[#687788]"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#687788] bg-white border border-[#E2E8EF] px-1.5 py-0.5 rounded">
            Enter
          </kbd>
        </div>
      </form>

      {/* Right: Quick Role Switcher Pill, Notifications & User Menu */}
      <div className="flex items-center gap-3">
        {/* Sales Copilot Quick Access */}
        <button
          onClick={() => setCopilotOpen(true)}
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#E8F5F2] hover:bg-[#d5ece6] text-[#16856D] border border-[#16856D]/30 transition-colors shadow-xs"
          title="Open AI Sales Copilot"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Copilot</span>
        </button>

        {/* Quick Role Tester Pill */}
        {user && (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setRoleSwitchOpen(!roleSwitchOpen)}
              className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 text-xs font-medium rounded-lg border border-[#E2E8EF] bg-[#F7F9FB] hover:bg-[#E9F1F5] text-[#142D4E] transition-colors"
              title="Click to switch role and test route guards"
            >
              <span className="w-2 h-2 rounded-full bg-[#16856D]" />
              <span className="text-[11px] text-[#687788]">Role:</span>
              <span className="font-bold uppercase tracking-wider text-[11px]">
                {user.role}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#687788]" />
            </button>

            {/* Role Switcher Popover */}
            {roleSwitchOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-[#E2E8EF] py-2 z-50">
                <div className="px-3 py-1.5 border-b border-[#E2E8EF]">
                  <p className="text-xs font-semibold text-[#182536]">Switch Operational Role</p>
                  <p className="text-[11px] text-[#687788]">
                    Test role-based sidebar visibility and route guards
                  </p>
                </div>
                <div className="py-1">
                  {availableRoles.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => handleRoleSelect(r.role)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#F7F9FB] transition-colors ${
                        user.role === r.role ? 'bg-[#E9F1F5] font-semibold text-[#142D4E]' : 'text-[#182536]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="uppercase font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/5">
                            {r.role}
                          </span>
                          <span>{r.title}</span>
                        </div>
                        <p className="text-[10px] text-[#687788] mt-0.5">{r.desc}</p>
                      </div>
                      {user.role === r.role && (
                        <CheckCircle2 className="w-4 h-4 text-[#16856D] flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-lg text-[#687788] hover:text-[#142D4E] hover:bg-[#E9F1F5] relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C44545]" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-[#E2E8EF] py-2 z-50">
              <div className="px-4 py-2 border-b border-[#E2E8EF] flex items-center justify-between">
                <span className="text-xs font-bold text-[#182536] font-['Manrope']">
                  Brokerage Alerts & Tasks
                </span>
                <span className="text-[10px] text-[#16856D] font-semibold cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="divide-y divide-[#E2E8EF] max-h-72 overflow-y-auto">
                {NOTIFICATIONS.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-[#F7F9FB] transition-colors text-left cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-[#182536]">{n.title}</p>
                      <span className="text-[10px] text-[#687788] flex items-center gap-1 flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        {n.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#687788] mt-1 leading-normal">{n.desc}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-[#E2E8EF] text-center">
                <Link
                  to="/app/tasks"
                  onClick={() => setNotifOpen(false)}
                  className="text-xs text-[#142D4E] font-medium hover:underline inline-flex items-center gap-1"
                >
                  <span>View all CRM tasks</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Menu */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-[#E9F1F5] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#142D4E] text-white flex items-center justify-center font-bold text-xs">
              {user?.name
                ? user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                : 'FC'}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-semibold text-[#182536] leading-none">
                {user?.name || 'Authorized User'}
              </p>
              <p className="text-[10px] text-[#687788] mt-0.5 leading-none capitalize">
                {user?.role}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#687788]" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-[#E2E8EF] py-2 z-50">
              <div className="px-4 py-2.5 border-b border-[#E2E8EF]">
                <p className="text-sm font-bold text-[#182536]">{user?.name}</p>
                <p className="text-xs text-[#687788]">{user?.email}</p>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#142D4E] font-medium">
                  <Building className="w-3 h-3 text-[#16856D]" />
                  <span>{user?.branch || 'Headquarters'}</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileOpen(false)
                    setRoleSwitchOpen(true)
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[#182536] hover:bg-[#F7F9FB] flex items-center gap-2"
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#16856D]" />
                  <span>Switch Role ({user?.role})</span>
                </button>
                <Link
                  to="/app/settings"
                  onClick={() => setProfileOpen(false)}
                  className="w-full text-left px-4 py-2 text-xs text-[#182536] hover:bg-[#F7F9FB] flex items-center gap-2"
                >
                  <span>Brokerage Settings</span>
                </Link>
                <Link
                  to="/"
                  onClick={() => setProfileOpen(false)}
                  className="w-full text-left px-4 py-2 text-xs text-[#182536] hover:bg-[#F7F9FB] flex items-center gap-2"
                >
                  <span>Customer Public Website</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-[#E2E8EF]">
                <button
                  onClick={() => {
                    logout()
                    navigate('/login')
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[#C44545] hover:bg-[#FDF2F2] flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global AI Sales Copilot Drawer */}
      <SalesCopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        initialAction="CUSTOMER_SUMMARY"
      />
    </header>
  )
}
