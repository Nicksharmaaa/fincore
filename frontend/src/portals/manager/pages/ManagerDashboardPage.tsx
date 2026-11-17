import React, { useState, useEffect } from 'react'
import {
  Users,
  CheckCircle2,
  FileText,
  ClipboardList,
  ShieldCheck,
  TrendingUp,
  Banknote,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
} from 'lucide-react'

const IS_DEMO = true

const formatINR = (amount: number): string => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} Lakh`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return `₹${amount.toLocaleString('en-IN')}`
}

const DemoBadge = () =>
  IS_DEMO ? (
    <span className="text-[10px] font-bold text-[#C58A36] bg-[#FDF7EE] border border-[#C58A36]/20 px-1.5 py-0.5 rounded">
      DEMO DATA
    </span>
  ) : null

const SEED_KPIs = {
  totalLeads: 312,
  totalLeadsChange: +18,
  qualifiedLeads: 198,
  qualifiedPct: 63.5,
  quotationsGenerated: 141,
  quotationsChange: +11,
  applicationsSubmitted: 72,
  applicationsChange: +6,
  policiesIssued: 48,
  policiesChange: +4,
  conversionRate: 15.4,
  conversionChange: +1.2,
  expectedCommission: 824000,
  receivedCommission: 538000,
}

const SEED_FUNNEL = [
  { stage: 'Website Visitors', count: 4820, pct: 100, prevPct: null, isDemo: true },
  { stage: 'Assessments Completed', count: 672, pct: 13.9, prevPct: 13.9, isDemo: false },
  { stage: 'Qualified Enquiries', count: 312, pct: 46.4, prevPct: 46.4, isDemo: false },
  { stage: 'Quotations Generated', count: 141, pct: 45.2, prevPct: 45.2, isDemo: false },
  { stage: 'Applications Submitted', count: 72, pct: 51.1, prevPct: 51.1, isDemo: false },
  { stage: 'Policies Issued', count: 48, pct: 66.7, prevPct: 66.7, isDemo: false },
]

const SEED_ADVISORS = [
  { name: 'Rahul Sharma', leads: 68, conversion: 22.1 },
  { name: 'Priya Patel', leads: 55, conversion: 18.2 },
  { name: 'Arjun Kapoor', leads: 49, conversion: 20.4 },
  { name: 'Neha Verma', leads: 44, conversion: 15.9 },
  { name: 'Deepak Joshi', leads: 38, conversion: 13.2 },
]

const SEED_INSURERS = [
  { name: 'HDFC Life', applications: 28, policies: 19 },
  { name: 'ICICI Prudential', applications: 21, policies: 14 },
  { name: 'SBI Life', applications: 14, policies: 9 },
  { name: 'Max Life', applications: 10, policies: 6 },
  { name: 'LIC of India', applications: 7, policies: 4 },
]

const SEED_COMMISSION = [
  { label: 'Expected (Accrued)', amount: 824000, color: '#142D4E' },
  { label: 'Received (Paid)', amount: 538000, color: '#16856D' },
  { label: 'Under Reconciliation', amount: 286000, color: '#C58A36' },
]

type DateRange = 'MTD' | '30D' | '90D' | 'CUSTOM'

export const ManagerDashboardPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>('MTD')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [kpis, setKpis] = useState(SEED_KPIs)
  const [funnel, setFunnel] = useState(SEED_FUNNEL)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    setLoading(true)
    fetch('/api/v1/analytics/executive-overview', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setKpis(data) })
      .catch(() => {})
      .finally(() => setLoading(false))

    fetch('/api/v1/analytics/sales-funnel', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setFunnel(data) })
      .catch(() => {})
  }, [dateRange, customFrom, customTo])

  const kpiCards = [
    {
      label: 'Total Leads',
      value: kpis.totalLeads.toLocaleString('en-IN'),
      trend: kpis.totalLeadsChange,
      sub: 'All inbound enquiries',
      icon: Users,
    },
    {
      label: 'Qualified Leads',
      value: `${kpis.qualifiedPct}%`,
      trend: null,
      sub: `${kpis.qualifiedLeads} of ${kpis.totalLeads} leads`,
      icon: CheckCircle2,
    },
    {
      label: 'Quotations Generated',
      value: kpis.quotationsGenerated.toLocaleString('en-IN'),
      trend: kpis.quotationsChange,
      sub: 'Multi-insurer proposals',
      icon: FileText,
    },
    {
      label: 'Applications Submitted',
      value: kpis.applicationsSubmitted.toLocaleString('en-IN'),
      trend: kpis.applicationsChange,
      sub: 'Forwarded to insurers',
      icon: ClipboardList,
    },
    {
      label: 'Policies Issued',
      value: kpis.policiesIssued.toLocaleString('en-IN'),
      trend: kpis.policiesChange,
      sub: 'Confirmed by insurers',
      icon: ShieldCheck,
    },
    {
      label: 'Conversion Rate',
      value: `${kpis.conversionRate}%`,
      trend: kpis.conversionChange,
      sub: 'Lead → Policy issued',
      icon: TrendingUp,
    },
    {
      label: 'Expected Commission',
      value: formatINR(kpis.expectedCommission),
      trend: null,
      sub: 'PENDING accruals',
      icon: Banknote,
      accent: '#C58A36',
    },
    {
      label: 'Received Commission',
      value: formatINR(kpis.receivedCommission),
      trend: null,
      sub: 'PAID & reconciled',
      icon: Wallet,
      accent: '#16856D',
    },
  ]

  const funnelMax = funnel[0]?.count || 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#E2E8EF]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#16856D]">
            Executive Intelligence
          </span>
          <h1 className="text-2xl font-bold text-[#142D4E] font-['Manrope'] mt-0.5">
            Business Intelligence Dashboard
          </h1>
          <p className="text-xs text-[#687788] mt-0.5">
            Consolidated brokerage performance metrics · IRDAI-compliant commission pipeline
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Lock className="w-3 h-3 text-[#687788]" />
            <span className="text-[11px] text-[#687788]">Manager &amp; Admin access only. Data is role-restricted.</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-[11px] font-bold bg-[#142D4E] text-white px-2.5 py-1 rounded-full">
            Manager &amp; Admin Access Only
          </span>
          <div className="flex items-center gap-1.5">
            {(['MTD', '30D', '90D', 'CUSTOM'] as DateRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded border transition-all ${
                  dateRange === r
                    ? 'bg-[#142D4E] text-white border-[#142D4E]'
                    : 'bg-white text-[#687788] border-[#E2E8EF] hover:border-[#142D4E]'
                }`}
              >
                {r === 'MTD' ? 'MTD' : r === '30D' ? 'Last 30 Days' : r === '90D' ? 'Last 90 Days' : 'Custom'}
              </button>
            ))}
          </div>
          {dateRange === 'CUSTOM' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="text-xs border border-[#E2E8EF] rounded px-2 py-1 text-[#182536] bg-white"
              />
              <span className="text-xs text-[#687788]">to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="text-xs border border-[#E2E8EF] rounded px-2 py-1 text-[#182536] bg-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Section 1: KPI Ribbon */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-bold text-[#142D4E] font-['Manrope']">Executive KPI Ribbon</h2>
          <DemoBadge />
          {loading && <span className="text-[10px] text-[#687788]">Refreshing…</span>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {kpiCards.map((card, i) => {
            const Icon = card.icon
            const isPositive = card.trend !== null && card.trend > 0
            const isNegative = card.trend !== null && card.trend < 0
            return (
              <div
                key={i}
                className="bg-white rounded-xl border border-[#E2E8EF] p-4 shadow-xs space-y-1 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#687788]">{card.label}</span>
                  <Icon className="w-3.5 h-3.5 text-[#687788]" />
                </div>
                <div
                  className="text-2xl font-black font-['Manrope'] leading-tight"
                  style={{ color: card.accent || '#142D4E' }}
                >
                  {card.value}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {card.trend !== null && (
                    <span
                      className={`text-[10px] font-bold flex items-center gap-0.5 ${
                        isPositive ? 'text-[#16856D]' : isNegative ? 'text-[#C44545]' : 'text-[#687788]'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : isNegative ? (
                        <ArrowDownRight className="w-3 h-3" />
                      ) : null}
                      {card.trend > 0 ? '+' : ''}{card.trend} vs prior period
                    </span>
                  )}
                  <span className="text-[10px] text-[#687788]">{card.sub}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Section 2: Sales Funnel */}
      <div className="bg-white rounded-xl border border-[#E2E8EF] p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-sm font-bold text-[#142D4E] font-['Manrope']">Sales Conversion Funnel</h2>
          <DemoBadge />
        </div>
        <div className="space-y-3">
          {funnel.map((stage, idx) => {
            const barWidth = Math.round((stage.count / funnelMax) * 100)
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#182536]">{stage.stage}</span>
                    {stage.isDemo && (
                      <span className="text-[9px] font-bold text-[#C58A36] bg-[#FDF7EE] border border-[#C58A36]/20 px-1 py-0.5 rounded">
                        DEMO — Estimated
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#142D4E]">{stage.count.toLocaleString('en-IN')}</span>
                    {stage.prevPct !== null && (
                      <span className="text-[#687788] text-[11px]">{stage.prevPct}% from prev</span>
                    )}
                  </div>
                </div>
                <div className="w-full h-3 bg-[#E9F1F5] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${barWidth}%`,
                      background: idx === 0 ? '#687788' : idx < 3 ? '#142D4E' : '#16856D',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Section 3: 3-column summary grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Advisors */}
        <div className="bg-white rounded-xl border border-[#E2E8EF] p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-bold text-[#142D4E] font-['Manrope']">Top Performing Advisors</h3>
            <DemoBadge />
          </div>
          <table className="w-full text-xs">
            <thead className="bg-[#F7F9FB] border-b border-[#E2E8EF]">
              <tr>
                <th className="py-2 px-2 text-left text-[#687788] font-semibold">Advisor</th>
                <th className="py-2 px-2 text-center text-[#687788] font-semibold">Leads</th>
                <th className="py-2 px-2 text-center text-[#687788] font-semibold">Conv%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8EF]">
              {SEED_ADVISORS.map((a, i) => (
                <tr key={i} className="hover:bg-[#F7F9FB]">
                  <td className="py-2 px-2 font-semibold text-[#182536]">{a.name}</td>
                  <td className="py-2 px-2 text-center text-[#182536]">{a.leads}</td>
                  <td className="py-2 px-2 text-center">
                    <span
                      className={`font-bold ${
                        a.conversion >= 20
                          ? 'text-[#16856D]'
                          : a.conversion >= 10
                          ? 'text-[#C58A36]'
                          : 'text-[#C44545]'
                      }`}
                    >
                      {a.conversion}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Insurer Volume */}
        <div className="bg-white rounded-xl border border-[#E2E8EF] p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-bold text-[#142D4E] font-['Manrope']">Insurer Volume</h3>
            <DemoBadge />
          </div>
          <table className="w-full text-xs">
            <thead className="bg-[#F7F9FB] border-b border-[#E2E8EF]">
              <tr>
                <th className="py-2 px-2 text-left text-[#687788] font-semibold">Insurer</th>
                <th className="py-2 px-2 text-center text-[#687788] font-semibold">Apps</th>
                <th className="py-2 px-2 text-center text-[#687788] font-semibold">Policies</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8EF]">
              {SEED_INSURERS.map((ins, i) => (
                <tr key={i} className="hover:bg-[#F7F9FB]">
                  <td className="py-2 px-2 font-semibold text-[#182536]">{ins.name}</td>
                  <td className="py-2 px-2 text-center text-[#182536]">{ins.applications}</td>
                  <td className="py-2 px-2 text-center font-bold text-[#16856D]">{ins.policies}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Commission Pipeline */}
        <div className="bg-white rounded-xl border border-[#E2E8EF] p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-bold text-[#142D4E] font-['Manrope']">Commission Pipeline</h3>
            <DemoBadge />
          </div>
          <div className="space-y-3">
            {SEED_COMMISSION.map((item, i) => {
              const maxAmt = SEED_COMMISSION[0].amount
              const barPct = Math.round((item.amount / maxAmt) * 100)
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#687788]">{item.label}</span>
                    <span className="font-bold" style={{ color: item.color }}>
                      {formatINR(item.amount)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#E9F1F5] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${barPct}%`, background: item.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-[10px] text-[#687788] mt-4 leading-relaxed">
            Under IRDAI Commission Regulations 2023 · First year &amp; Renewal rates apply.
          </p>
        </div>
      </div>
    </div>
  )
}
