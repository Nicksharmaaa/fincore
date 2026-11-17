import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { EMPLOYEE_NAV_ITEMS } from '../../routes/navigation'
import { useAuth } from '../../context/AuthContext'
import { Logo } from '../shared/Logo'
import {
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  ChevronDown,
  X,
  ExternalLink,
} from 'lucide-react'

interface AppSidebarProps {
  mobileOpen?: boolean
  onCloseMobile?: () => void
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  mobileOpen = false,
  onCloseMobile,
}) => {
  const [collapsed, setCollapsed] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})
  const { user } = useAuth()
  const location = useLocation()

  // Filter navigation items by current user role
  const allowedItems = EMPLOYEE_NAV_ITEMS.filter((item) =>
    user ? item.roles.includes(user.role) : false
  )

  // Group items by section
  const sections: Array<'Core CRM' | 'Policy Lifecycle' | 'Intelligence & Registry' | 'System'> = [
    'Core CRM',
    'Policy Lifecycle',
    'Intelligence & Registry',
    'System',
  ]

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const sidebarContent = (
    <aside
      className={`h-full flex flex-col transition-all duration-200 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
      style={{
        backgroundColor: '#142D4E',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Brand & Workspace Title */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1D3D5C] flex-shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <Logo variant="light" to="/app" />
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#16856D] text-white px-1.5 py-0.5 rounded">
              CRM
            </span>
          </div>
        ) : (
          <div className="mx-auto">
            <Logo variant="light" to="/app" />
          </div>
        )}

        {/* Mobile close button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-white/70 hover:text-white p-1 rounded-md"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Role Indicator Capsule */}
      {!collapsed && user && (
        <div className="px-4 py-2.5 bg-[#10243E] border-b border-[#1D3D5C] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#16856D]" />
            <span className="text-white/75 truncate font-medium">Role:</span>
            <span className="font-semibold text-white uppercase tracking-wider text-[11px] bg-[#1D3D5C] px-2 py-0.5 rounded">
              {user.role}
            </span>
          </div>
          <span className="text-[10px] text-white/50">{user.department?.split(' ')[0]}</span>
        </div>
      )}

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {sections.map((section) => {
          const sectionItems = allowedItems.filter((i) => i.section === section)
          if (sectionItems.length === 0) return null

          const isSectionCollapsed = collapsedSections[section]

          return (
            <div key={section} className="space-y-1">
              {!collapsed && (
                <button
                  type="button"
                  onClick={() => toggleSection(section)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/50 hover:text-white/80 transition-colors"
                >
                  <span>{section}</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${
                      isSectionCollapsed ? '-rotate-90' : 'rotate-0'
                    }`}
                  />
                </button>
              )}

              {(!isSectionCollapsed || collapsed) && (
                <div className="space-y-0.5 pt-0.5">
                  {sectionItems.map((item) => {
                    const Icon = item.icon
                    const isActive =
                      item.path === '/app'
                        ? location.pathname === '/app' || location.pathname === '/app/'
                        : location.pathname.startsWith(item.path)

                    return (
                      <NavLink
                        key={item.id}
                        to={item.path}
                        onClick={onCloseMobile}
                        title={collapsed ? item.label : undefined}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                          isActive
                            ? 'bg-white/15 text-white font-semibold shadow-xs'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                        } ${collapsed ? 'justify-center' : ''}`}
                      >
                        <Icon
                          className={`w-4 h-4 flex-shrink-0 transition-colors ${
                            isActive ? 'text-[#16856D]' : 'text-white/60 group-hover:text-white'
                          }`}
                        />
                        {!collapsed && (
                          <div className="flex-1 flex items-center justify-between truncate">
                            <span className="truncate">{item.label}</span>
                            {item.badge && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                  isActive
                                    ? 'bg-[#16856D] text-white'
                                    : 'bg-white/10 text-white/80'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}
                      </NavLink>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Switch to Public Website Link */}
      <div className="p-3 border-t border-[#1D3D5C] bg-[#10243E]">
        {!collapsed ? (
          <NavLink
            to="/"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#16856D]" />
              <span>Customer Website</span>
            </span>
            <ExternalLink className="w-3 h-3 text-white/50" />
          </NavLink>
        ) : (
          <NavLink
            to="/"
            title="Public Website"
            className="flex items-center justify-center p-2 text-white/70 hover:text-white rounded-lg"
          >
            <Layers className="w-4 h-4 text-[#16856D]" />
          </NavLink>
        )}

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-full mt-2 items-center justify-center py-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/5 text-xs transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="ml-1.5 text-[11px]">Collapse View</span>}
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 flex-shrink-0 z-30">
        {sidebarContent}
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
