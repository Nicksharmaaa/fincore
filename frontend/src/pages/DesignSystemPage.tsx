import React from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/shared/Logo'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  LayoutDashboard,
  Search,
} from 'lucide-react'

export const DesignSystemPage: React.FC = () => {
  const brandColors = [
    { name: 'Primary Navy', hex: '#142D4E', usage: 'Header, brand anchor, primary dark' },
    { name: 'Secondary Navy', hex: '#1D3D5C', usage: 'Sidebar highlight, hover states' },
    { name: 'Accent Emerald', hex: '#16856D', usage: 'CTAs, positive metrics, conversion signals' },
    { name: 'Light Surface', hex: '#E9F1F5', usage: 'Input backgrounds, subtle pill tags' },
    { name: 'Main Background', hex: '#F7F9FB', usage: 'App and portal canvas background' },
    { name: 'White', hex: '#FFFFFF', usage: 'Cards, elevated surfaces, modal canvas' },
    { name: 'Primary Text', hex: '#182536', usage: 'High contrast headlines and labels' },
    { name: 'Secondary Text', hex: '#687788', usage: 'Captions, timestamps, descriptions' },
    { name: 'Border', hex: '#E2E8EF', usage: '1px structural dividers and boundaries' },
    { name: 'Error', hex: '#C44545', usage: 'Form errors, lost leads, critical exclusions' },
    { name: 'Warning', hex: '#C58A36', usage: 'Pending regulatory actions, reminders' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 bg-[#F7F9FB]">
      {/* Top Banner */}
      <div className="bg-[#142D4E] text-white rounded-2xl p-8 sm:p-10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <Logo variant="light" withTagline={true} />
          <h1 className="text-3xl font-extrabold font-['Manrope'] mt-4">
            FINCORE Design System & Token Specification
          </h1>
          <p className="text-sm text-white/75 max-w-xl leading-relaxed">
            Enterprise financial technology design language engineered for an authorised life insurance brokerage in India. Grounded in minimal, trustworthy, and human-friendly aesthetics.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/"
            className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold text-center transition-colors"
          >
            Customer Website &rarr;
          </Link>
          <Link
            to="/app"
            className="px-4 py-2.5 rounded-lg bg-[#16856D] hover:bg-[#0F6B57] text-white text-xs font-semibold text-center transition-colors shadow-xs"
          >
            Employee CRM &rarr;
          </Link>
        </div>
      </div>

      {/* 1. Brand Colours */}
      <section className="space-y-4">
        <div className="border-b border-[#E2E8EF] pb-3">
          <h2 className="text-xl font-bold text-[#142D4E] font-['Manrope']">
            1. Colour System & Tokens
          </h2>
          <p className="text-xs text-[#687788]">
            Restrained, purposeful fintech palette. No excessive gradients or neon tones.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {brandColors.map((color) => (
            <div
              key={color.name}
              className="bg-white rounded-xl border border-[#E2E8EF] p-4 shadow-xs space-y-3"
            >
              <div
                className="w-full h-14 rounded-lg border border-black/5"
                style={{ backgroundColor: color.hex }}
              />
              <div>
                <span className="font-bold text-xs text-[#182536] block">{color.name}</span>
                <span className="font-mono text-[11px] text-[#142D4E] font-semibold">{color.hex}</span>
                <p className="text-[10px] text-[#687788] mt-1 leading-normal">{color.usage}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Typography Scale */}
      <section className="space-y-4">
        <div className="border-b border-[#E2E8EF] pb-3">
          <h2 className="text-xl font-bold text-[#142D4E] font-['Manrope']">
            2. Typography Hierarchy
          </h2>
          <p className="text-xs text-[#687788]">
            Headings: <strong>Manrope</strong> (deliberate geometric weights). Body and tables: <strong>Inter</strong>.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8EF] p-6 shadow-xs divide-y divide-[#E2E8EF]">
          <div className="py-4">
            <span className="text-[11px] font-mono text-[#687788]">Display 2XL &bull; Manrope 48px</span>
            <p className="text-4xl sm:text-5xl font-extrabold text-[#142D4E] font-['Manrope'] mt-1">
              Intelligent insurance. Simplified decisions.
            </p>
          </div>
          <div className="py-4">
            <span className="text-[11px] font-mono text-[#687788]">Heading XL &bull; Manrope 28px</span>
            <p className="text-2xl sm:text-3xl font-bold text-[#142D4E] font-['Manrope'] mt-1">
              Multi-Insurer Comparison Engine
            </p>
          </div>
          <div className="py-4">
            <span className="text-[11px] font-mono text-[#687788]">Heading MD &bull; Manrope 18px</span>
            <p className="text-lg font-bold text-[#182536] font-['Manrope'] mt-1">
              Click 2 Protect Super &bull; HDFC Life Insurance (v4.2)
            </p>
          </div>
          <div className="py-4">
            <span className="text-[11px] font-mono text-[#687788]">Body Regular &bull; Inter 14px</span>
            <p className="text-sm text-[#182536] mt-1 leading-relaxed max-w-2xl">
              Fincore is an authorised insurance technology broker registered with IRDAI. Quotations are strictly verified against official rate cards. No arbitrary pricing or invented underwriting decisions.
            </p>
          </div>
          <div className="py-4">
            <span className="text-[11px] font-mono text-[#687788]">Caption & Data Labels &bull; Inter 12px</span>
            <p className="text-xs text-[#687788] mt-1">
              Statutory Notice: Reg. No. DB-984/2024 &bull; Life cover subject to insurer underwriting.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Button and Input Primitives */}
      <section className="space-y-4">
        <div className="border-b border-[#E2E8EF] pb-3">
          <h2 className="text-xl font-bold text-[#142D4E] font-['Manrope']">
            3. Action & Form Primitives
          </h2>
          <p className="text-xs text-[#687788]">
            8-12px border radius, high-readability form fields, clear active states.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Buttons */}
          <div className="bg-white rounded-xl border border-[#E2E8EF] p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#142D4E]">
              Button Variants
            </h3>
            <div className="flex flex-wrap gap-3 items-center">
              <button className="px-4 py-2 rounded-lg bg-[#142D4E] text-white text-xs font-semibold hover:bg-[#1D3D5C]">
                Primary Navy
              </button>
              <button className="px-4 py-2 rounded-lg bg-[#16856D] text-white text-xs font-semibold hover:bg-[#0F6B57]">
                Accent Emerald
              </button>
              <button className="px-4 py-2 rounded-lg border border-[#E2E8EF] text-[#142D4E] text-xs font-semibold hover:bg-[#F7F9FB]">
                Secondary Outline
              </button>
              <button className="px-4 py-2 rounded-lg bg-[#E9F1F5] text-[#142D4E] text-xs font-semibold hover:bg-[#d8e7ee]">
                Subtle Surface
              </button>
              <button className="px-4 py-2 rounded-lg bg-[#C44545] text-white text-xs font-semibold">
                Destructive Action
              </button>
            </div>
          </div>

          {/* Badges */}
          <div className="bg-white rounded-xl border border-[#E2E8EF] p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#142D4E]">
              Status Badges
            </h3>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold bg-[#E8F5F2] text-[#16856D] px-2.5 py-1 rounded">
                Verified / In Force
              </span>
              <span className="text-xs font-bold bg-[#FDF7EE] text-[#C58A36] px-2.5 py-1 rounded">
                Pending Underwriting
              </span>
              <span className="text-xs font-bold bg-[#FDF2F2] text-[#C44545] px-2.5 py-1 rounded">
                Declined / Lost
              </span>
              <span className="text-xs font-bold bg-[#E9F1F5] text-[#142D4E] px-2.5 py-1 rounded">
                New Proposal
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Experience Architecture Comparison */}
      <section className="space-y-4">
        <div className="border-b border-[#E2E8EF] pb-3">
          <h2 className="text-xl font-bold text-[#142D4E] font-['Manrope']">
            4. Two Distinct Layout Experiences
          </h2>
          <p className="text-xs text-[#687788]">
            Customer Portal (editorial, welcoming, trustworthy) vs Employee CRM (dense, fast, high-information).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="bg-white rounded-xl border border-[#E2E8EF] p-6 space-y-3">
            <span className="font-bold text-sm text-[#142D4E] block font-['Manrope']">
              Customer Portal Experience
            </span>
            <p className="text-[#687788]">
              Designed mobile-first. Clean, generous whitespace, educational guidance, and transparent policy wording breakdowns.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16856D] hover:underline"
            >
              <span>Explore Public Site</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-[#142D4E] text-white rounded-xl p-6 space-y-3">
            <span className="font-bold text-sm text-white block font-['Manrope']">
              Employee Workspace Experience
            </span>
            <p className="text-white/75">
              Persistent left sidebar, compact top navigation, dynamic breadcrumbs, role-based visibility, and data-dense tables.
            </p>
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16856D] hover:underline"
            >
              <span>Explore Employee Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
