import React, { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Logo } from '../shared/Logo'
import { Menu, X, ArrowRight, Shield, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export const PublicHeader: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Insurance', path: '/insurance' },
    { label: 'Compare', path: '/compare' },
    { label: 'How it works', path: '/about#how-it-works' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ]

  return (
    <header
      className="sticky top-0 z-40 w-full bg-white border-b border-[#E2E8EF] transition-all"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* IRDAI Regulatory Notification strip */}
      <div className="bg-[#142D4E] text-white/80 text-[11px] py-1 px-4 text-center font-medium">
        <span className="inline-flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-[#16856D]" />
          <span>FINCORE Technologies &bull; Registered Direct Life Insurance Broker &bull; IRDAI Registration No. DB-984/24</span>
          <span className="hidden md:inline text-white/40">|</span>
          <Link
            to="/app"
            className="hidden md:inline-flex items-center text-[#16856D] hover:underline font-semibold"
          >
            Employee Workspace &rarr;
          </Link>
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Logo withTagline={true} />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors py-1 relative ${
                    isActive && !link.path.includes('#')
                      ? 'text-[#142D4E] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#16856D]'
                      : 'text-[#687788] hover:text-[#142D4E]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated && user?.role !== 'customer' && (
              <Link
                to="/app"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#E9F1F5] text-[#142D4E] hover:bg-[#d8e7ee] transition-colors border border-[#E2E8EF]"
                title="Go to Employee Workspace"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#16856D]" />
                CRM Workspace ({user?.role})
              </Link>
            )}

            <Link
              to="/login"
              className="inline-flex items-center gap-1 px-3.5 py-2 text-sm font-medium text-[#182536] hover:text-[#142D4E] transition-colors rounded-lg"
            >
              <User className="w-4 h-4 text-[#687788]" />
              <span>Login</span>
            </Link>

            <button
              onClick={() => navigate('/assessment')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#16856D] hover:bg-[#0F6B57] transition-all rounded-lg shadow-sm active:scale-[0.98]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu hamburger */}
          <div className="flex sm:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#687788] hover:text-[#182536] hover:bg-[#E9F1F5] focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E2E8EF] bg-white px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-[#E9F1F5] text-[#142D4E] font-semibold'
                    : 'text-[#687788] hover:bg-[#F7F9FB] hover:text-[#142D4E]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="pt-4 border-t border-[#E2E8EF] flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-medium text-[#142D4E] border border-[#E2E8EF] rounded-lg"
            >
              Login
            </Link>
            <Link
              to="/assessment"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-semibold text-white bg-[#16856D] rounded-lg"
            >
              Get Started &rarr;
            </Link>
            <Link
              to="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 text-xs font-medium text-[#687788] hover:underline"
            >
              Go to Employee CRM Workspace &rarr;
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
