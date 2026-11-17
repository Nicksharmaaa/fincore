import React, { useState, useEffect } from 'react'
import { Search, Lightbulb } from 'lucide-react'

const IS_DEMO = true

const DemoBadge = () =>
  IS_DEMO ? (
    <span className="text-[10px] font-bold text-[#C58A36] bg-[#FDF7EE] border border-[#C58A36]/20 px-1.5 py-0.5 rounded">
      DEMO DATA
    </span>
  ) : null

interface LostLead {
  id: string
  customer: string
  productInterest: string
  source: string
  lostReason: string
  salesStage: string
  activitiesCount: number
  lostDate: string
}

interface PatternItem {
  label: string
  count: number
  pct: number
}

const SEED_LOST_LEADS: LostLead[] = [
  { id: 'LD-1008', customer: 'Pooja Deshmukh', productInterest: 'Sampoorna Raksha Supreme', source: 'Website Enquiry', lostReason: 'Opted for group cover', salesStage: 'Quote Sent', activitiesCount: 4, lostDate: '08-Nov-2026' },
  { id: 'LD-1012', customer: 'Amit Verma', productInterest: 'iProtect Smart', source: 'Referral', lostReason: 'Premium too high', salesStage: 'Quote Requested', activitiesCount: 2, lostDate: '10-Nov-2026' },
  { id: 'LD-1019', customer: 'Sunita Rao', productInterest: 'Smart Wealth Goal (ULIP)', source: 'Website Assessment', lostReason: 'Preferred mutual funds', salesStage: 'Needs Assessment', activitiesCount: 1, lostDate: '12-Nov-2026' },
  { id: 'LD-1023', customer: 'Kartik Nair', productInterest: 'Tech Term', source: 'Direct', lostReason: 'No response after follow-up', salesStage: 'Contacted', activitiesCount: 3, lostDate: '13-Nov-2026' },
  { id: 'LD-1031', customer: 'Divya Singh', productInterest: 'eShield Next', source: 'Partner', lostReason: 'Bought from bank channel', salesStage: 'Quote Sent', activitiesCount: 5, lostDate: '14-Nov-2026' },
  { id: 'LD-1038', customer: 'Vikas Mehta', productInterest: 'Fortune Builder (ULIP)', source: 'Website Assessment', lostReason: 'Competitor pricing', salesStage: 'Quote Requested', activitiesCount: 2, lostDate: '15-Nov-2026' },
  { id: 'LD-1044', customer: 'Rekha Joshi', productInterest: 'New Endowment Plan', source: 'Referral', lostReason: 'Medical decline', salesStage: 'Application In Progress', activitiesCount: 7, lostDate: '15-Nov-2026' },
  { id: 'LD-1051', customer: 'Ashish Kapoor', productInterest: 'Click 2 Protect Super', source: 'Website Enquiry', lostReason: 'No response after follow-up', salesStage: 'New', activitiesCount: 1, lostDate: '16-Nov-2026' },
]

const SEED_BY_REASON: PatternItem[] = [
  { label: 'Premium too high / Competitor pricing', count: 38, pct: 32.2 },
  { label: 'No response after follow-up', count: 29, pct: 24.6 },
  { label: 'Opted for group / bank channel', count: 22, pct: 18.6 },
  { label: 'Preferred mutual funds / other investment', count: 14, pct: 11.9 },
  { label: 'Medical decline', count: 8, pct: 6.8 },
  { label: 'Other', count: 7, pct: 5.9 },
]

const SEED_BY_SOURCE: PatternItem[] = [
  { label: 'Website Assessment', count: 42, pct: 35.6 },
  { label: 'Website Enquiry', count: 28, pct: 23.7 },
  { label: 'Referral', count: 24, pct: 20.3 },
  { label: 'Direct', count: 16, pct: 13.6 },
  { label: 'Partner', count: 8, pct: 6.8 },
]

const SEED_BY_STAGE: PatternItem[] = [
  { label: 'Quote Sent', count: 44, pct: 37.3 },
  { label: 'Quote Requested', count: 32, pct: 27.1 },
  { label: 'Contacted', count: 18, pct: 15.3 },
  { label: 'Needs Assessment', count: 14, pct: 11.9 },
  { label: 'Application In Progress', count: 10, pct: 8.5 },
]

const ACTIONABLE_INSIGHTS = [
  {
    issue: '37% of leads lost at Quote Sent stage',
    action: 'Review pricing positioning vs competitors. Consider quick-call escalation within 24h of quote delivery.',
    severity: '#C44545',
  },
  {
    issue: '24.6% lost due to no response after follow-up',
    action: 'Implement automated 48h follow-up reminder via WhatsApp. Flag leads with <2 activities to managers.',
    severity: '#C58A36',
  },
  {
    issue: '35.6% of lost leads originate from Website Assessment',
    action: 'Improve assessment-to-call handoff SLA. Assessment completions should trigger same-day advisor outreach.',
    severity: '#C58A36',
  },
]

const PatternPanel = ({ title, data }: { title: string; data: PatternItem[] }) => {
  const maxCount = data[0]?.count || 1
  return (
    <div className="bg-white rounded-xl border border-[#E2E8EF] p-5 shadow-xs">
      <h3 className="text-sm font-bold text-[#142D4E] font-['Manrope'] mb-3">{title}</h3>
      <div className="space-y-2.5">
        {data.map((item, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#182536] font-medium flex-1 mr-2 leading-tight">{item.label}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-bold text-[#142D4E]">{item.count}</span>
                <span className="text-[#687788]">{item.pct}%</span>
              </div>
            </div>
            <div className="w-full h-2 bg-[#E9F1F5] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#142D4E] rounded-full"
                style={{ width: `${Math.round((item.count / maxCount) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const LostLeadIntelligencePage: React.FC = () => {
  const [leads, setLeads] = useState<LostLead[]>(SEED_LOST_LEADS)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sourceFilter, setSourceFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    fetch('/api/v1/analytics/lost-leads', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (Array.isArray(data) && data.length > 0) setLeads(data) })
      .catch(() => {})
  }, [])

  const filtered = leads.filter((l) => {
    const matchSource = sourceFilter === 'All' || l.source === sourceFilter
    const matchSearch = !search || l.customer.toLowerCase().includes(search.toLowerCase()) || l.id.includes(search)
    return matchSource && matchSearch
  })

  const sources = ['All', ...Array.from(new Set(leads.map((l) => l.source)))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8EF]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#16856D]">
            Lost Revenue Intelligence
          </span>
          <h1 className="text-2xl font-bold text-[#142D4E] font-['Manrope'] mt-0.5">
            Lost Lead Intelligence
          </h1>
          <p className="text-xs text-[#687788] mt-0.5">
            Pattern analysis and root-cause identification for leads that did not convert.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="text-xs border border-[#E2E8EF] rounded-lg px-3 py-2 bg-white text-[#182536] focus:outline-none focus:border-[#142D4E]"
        />
        <span className="text-xs text-[#687788]">to</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="text-xs border border-[#E2E8EF] rounded-lg px-3 py-2 bg-white text-[#182536] focus:outline-none focus:border-[#142D4E]"
        />
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="text-xs border border-[#E2E8EF] rounded-lg px-3 py-2 bg-white text-[#182536] focus:outline-none focus:border-[#142D4E]"
        >
          {sources.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs border border-[#E2E8EF] rounded-lg px-3 py-2 bg-white text-[#182536] focus:outline-none focus:border-[#142D4E]"
        >
          {['All', 'Term Plans', 'ULIPs', 'Savings/Endowment', 'Whole Life', 'Annuity'].map((c) => <option key={c}>{c}</option>)}
        </select>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#687788]" />
          <input
            type="text"
            placeholder="Lead # or customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs border border-[#E2E8EF] rounded-lg pl-8 pr-3 py-2 bg-white text-[#182536] focus:outline-none focus:border-[#142D4E] w-44"
          />
        </div>
        <DemoBadge />
      </div>

      {/* Section 1: Pattern Analysis */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-bold text-[#142D4E] font-['Manrope']">Pattern Analysis</h2>
          <DemoBadge />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <PatternPanel title="By Lost Reason" data={SEED_BY_REASON} />
          <PatternPanel title="By Lead Source" data={SEED_BY_SOURCE} />
          <PatternPanel title="By Sales Stage when Lost" data={SEED_BY_STAGE} />
        </div>
      </div>

      {/* Section 2: Lost Lead Records */}
      <div className="bg-white rounded-xl border border-[#E2E8EF] shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-[#E2E8EF]">
          <h2 className="text-sm font-bold text-[#142D4E] font-['Manrope']">Lost Lead Records</h2>
          <DemoBadge />
          <span className="text-[11px] text-[#687788] ml-auto">{filtered.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#F7F9FB] border-b border-[#E2E8EF]">
              <tr>
                <th className="py-2.5 px-3 text-left font-semibold text-[#687788]">Lead #</th>
                <th className="py-2.5 px-3 text-left font-semibold text-[#687788]">Customer</th>
                <th className="py-2.5 px-3 text-left font-semibold text-[#687788]">Product Interest</th>
                <th className="py-2.5 px-3 text-left font-semibold text-[#687788]">Source</th>
                <th className="py-2.5 px-3 text-left font-semibold text-[#687788]">Lost Reason</th>
                <th className="py-2.5 px-3 text-left font-semibold text-[#687788]">Sales Stage</th>
                <th className="py-2.5 px-3 text-center font-semibold text-[#687788]">Activities</th>
                <th className="py-2.5 px-3 text-left font-semibold text-[#687788]">Lost Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8EF]">
              {filtered.map((lead) => (
                <tr key={lead.id} className="hover:bg-[#F7F9FB] transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#142D4E]">{lead.id}</td>
                  <td className="py-2.5 px-3 font-semibold text-[#182536]">{lead.customer}</td>
                  <td className="py-2.5 px-3 text-[#687788]">{lead.productInterest}</td>
                  <td className="py-2.5 px-3 text-[#687788]">{lead.source}</td>
                  <td className="py-2.5 px-3 text-[#182536]">{lead.lostReason}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] font-semibold text-[#142D4E] bg-[#E9F1F5] px-1.5 py-0.5 rounded">
                      {lead.salesStage}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {lead.activitiesCount < 2 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#C58A36] bg-[#FDF7EE] px-1.5 py-0.5 rounded">
                        {lead.activitiesCount} · Needs analysis
                      </span>
                    ) : (
                      <span className="font-semibold text-[#182536]">{lead.activitiesCount}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-[#687788]">{lead.lostDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actionable Insights */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-[#C58A36]" />
          <h2 className="text-sm font-bold text-[#142D4E] font-['Manrope']">Actionable Insights</h2>
          <DemoBadge />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {ACTIONABLE_INSIGHTS.map((insight, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E2E8EF] p-5 shadow-xs">
              <div
                className="text-[11px] font-bold uppercase tracking-wide mb-2"
                style={{ color: insight.severity }}
              >
                Issue Identified
              </div>
              <p className="text-xs font-semibold text-[#182536] mb-3 leading-relaxed">
                {insight.issue}
              </p>
              <div className="text-[11px] font-bold text-[#16856D] uppercase tracking-wide mb-1">
                Recommended Action
              </div>
              <p className="text-xs text-[#687788] leading-relaxed">{insight.action}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
