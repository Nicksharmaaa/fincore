import React, { useState, useEffect } from 'react'
import { Building2 } from 'lucide-react'

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

interface InsurerRow {
  name: string
  irdaiReg: string
  enquiries: number
  quotations: number
  applications: number
  policies: number
  declined: number
  avgPremium: number
  expectedComm: number
  receivedComm: number
  integrationStatus: 'Active' | 'Error' | 'Pending'
}

const SEED_INSURERS: InsurerRow[] = [
  {
    name: 'HDFC Life',
    irdaiReg: '101',
    enquiries: 128,
    quotations: 88,
    applications: 44,
    policies: 32,
    declined: 4,
    avgPremium: 24800,
    expectedComm: 312000,
    receivedComm: 198000,
    integrationStatus: 'Active',
  },
  {
    name: 'ICICI Prudential',
    irdaiReg: '105',
    enquiries: 98,
    quotations: 66,
    applications: 32,
    policies: 22,
    declined: 3,
    avgPremium: 21500,
    expectedComm: 224000,
    receivedComm: 148000,
    integrationStatus: 'Active',
  },
  {
    name: 'Max Life',
    irdaiReg: '104',
    enquiries: 72,
    quotations: 48,
    applications: 24,
    policies: 16,
    declined: 2,
    avgPremium: 19200,
    expectedComm: 156000,
    receivedComm: 98000,
    integrationStatus: 'Active',
  },
  {
    name: 'SBI Life',
    irdaiReg: '111',
    enquiries: 60,
    quotations: 38,
    applications: 18,
    policies: 12,
    declined: 1,
    avgPremium: 17400,
    expectedComm: 118000,
    receivedComm: 76000,
    integrationStatus: 'Active',
  },
  {
    name: 'LIC of India',
    irdaiReg: '512',
    enquiries: 44,
    quotations: 28,
    applications: 14,
    policies: 10,
    declined: 2,
    avgPremium: 14200,
    expectedComm: 84000,
    receivedComm: 48000,
    integrationStatus: 'Error',
  },
  {
    name: 'Tata AIA Life',
    irdaiReg: '110',
    enquiries: 36,
    quotations: 22,
    applications: 10,
    policies: 6,
    declined: 1,
    avgPremium: 22000,
    expectedComm: 62000,
    receivedComm: 38000,
    integrationStatus: 'Active',
  },
]

const IRDAI_REGS = [
  { insurer: 'HDFC Life', category: 'Term Plans', firstYear: '35%', renewal: '7.5%', cap: '35%', status: 'Compliant' },
  { insurer: 'ICICI Prudential', category: 'Term Plans', firstYear: '35%', renewal: '7.5%', cap: '35%', status: 'Compliant' },
  { insurer: 'Max Life', category: 'ULIPs', firstYear: '8%', renewal: '2%', cap: '8%', status: 'Compliant' },
  { insurer: 'SBI Life', category: 'Savings/Endowment', firstYear: '25%', renewal: '5%', cap: '25%', status: 'Compliant' },
  { insurer: 'LIC of India', category: 'Whole Life', firstYear: '25%', renewal: '5%', cap: '25%', status: 'Review' },
  { insurer: 'Tata AIA Life', category: 'Annuity', firstYear: '5%', renewal: '1.5%', cap: '5%', status: 'Compliant' },
]

export const InsurerAnalyticsPage: React.FC = () => {
  const [insurers, setInsurers] = useState<InsurerRow[]>(SEED_INSURERS)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    fetch('/api/v1/analytics/insurer-performance', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (Array.isArray(data) && data.length > 0) setInsurers(data) })
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8EF]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#16856D]">
            Insurer Intelligence
          </span>
          <h1 className="text-2xl font-bold text-[#142D4E] font-['Manrope'] mt-0.5">
            Insurer Partner Analytics
          </h1>
          <p className="text-xs text-[#687788] mt-0.5">
            Volume, commission, and integration status per empanelled insurer.
          </p>
        </div>
        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Main Insurer Table */}
      <div className="bg-white rounded-xl border border-[#E2E8EF] shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-[#E2E8EF]">
          <Building2 className="w-4 h-4 text-[#16856D]" />
          <h2 className="text-sm font-bold text-[#142D4E] font-['Manrope']">Per-Insurer Breakdown</h2>
          <DemoBadge />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#F7F9FB] border-b border-[#E2E8EF]">
              <tr>
                <th className="py-2.5 px-3 text-left font-semibold text-[#687788]">Insurer</th>
                <th className="py-2.5 px-3 text-left font-semibold text-[#687788]">IRDAI Reg</th>
                <th className="py-2.5 px-3 text-center font-semibold text-[#687788]">Enquiries</th>
                <th className="py-2.5 px-3 text-center font-semibold text-[#687788]">Quotations</th>
                <th className="py-2.5 px-3 text-center font-semibold text-[#687788]">Applications</th>
                <th className="py-2.5 px-3 text-center font-semibold text-[#687788]">Policies</th>
                <th className="py-2.5 px-3 text-center font-semibold text-[#687788]">Declined</th>
                <th className="py-2.5 px-3 text-center font-semibold text-[#687788]">Avg Premium</th>
                <th className="py-2.5 px-3 text-right font-semibold text-[#16856D]">Exp. Comm.</th>
                <th className="py-2.5 px-3 text-right font-semibold text-[#16856D]">Recv. Comm.</th>
                <th className="py-2.5 px-3 text-center font-semibold text-[#687788]">Integration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8EF]">
              {insurers.map((ins, i) => (
                <tr key={i} className="hover:bg-[#F7F9FB] transition-colors">
                  <td className="py-2.5 px-3 font-bold text-[#182536]">{ins.name}</td>
                  <td className="py-2.5 px-3 font-mono text-[#687788]">{ins.irdaiReg}</td>
                  <td className="py-2.5 px-3 text-center text-[#182536]">{ins.enquiries}</td>
                  <td className="py-2.5 px-3 text-center text-[#182536]">{ins.quotations}</td>
                  <td className="py-2.5 px-3 text-center text-[#182536]">{ins.applications}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-[#16856D]">{ins.policies}</td>
                  <td className="py-2.5 px-3 text-center text-[#C44545] font-semibold">{ins.declined}</td>
                  <td className="py-2.5 px-3 text-center text-[#182536]">{formatINR(ins.avgPremium)}</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-[#16856D]">{formatINR(ins.expectedComm)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#16856D]">{formatINR(ins.receivedComm)}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ins.integrationStatus === 'Active'
                          ? 'bg-[#E8F5F2] text-[#16856D]'
                          : ins.integrationStatus === 'Error'
                          ? 'bg-[#FDF2F2] text-[#C44545]'
                          : 'bg-[#FDF7EE] text-[#C58A36]'
                      }`}
                    >
                      {ins.integrationStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commission Reconciliation */}
      <div className="bg-white rounded-xl border border-[#E2E8EF] shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-[#E2E8EF]">
          <h2 className="text-sm font-bold text-[#142D4E] font-['Manrope']">
            Commission Reconciliation — IRDAI Commission Regs 2023
          </h2>
          <DemoBadge />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#F7F9FB] border-b border-[#E2E8EF]">
              <tr>
                <th className="py-2.5 px-3 text-left font-semibold text-[#687788]">Insurer</th>
                <th className="py-2.5 px-3 text-left font-semibold text-[#687788]">Category</th>
                <th className="py-2.5 px-3 text-center font-semibold text-[#687788]">First Year Rate</th>
                <th className="py-2.5 px-3 text-center font-semibold text-[#687788]">Renewal Rate</th>
                <th className="py-2.5 px-3 text-center font-semibold text-[#687788]">IRDAI Cap</th>
                <th className="py-2.5 px-3 text-center font-semibold text-[#687788]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8EF]">
              {IRDAI_REGS.map((reg, i) => (
                <tr key={i} className="hover:bg-[#F7F9FB]">
                  <td className="py-2.5 px-3 font-semibold text-[#182536]">{reg.insurer}</td>
                  <td className="py-2.5 px-3 text-[#687788]">{reg.category}</td>
                  <td className="py-2.5 px-3 text-center font-semibold text-[#142D4E]">{reg.firstYear}</td>
                  <td className="py-2.5 px-3 text-center text-[#182536]">{reg.renewal}</td>
                  <td className="py-2.5 px-3 text-center text-[#687788]">{reg.cap}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        reg.status === 'Compliant' ? 'bg-[#E8F5F2] text-[#16856D]' : 'bg-[#FDF7EE] text-[#C58A36]'
                      }`}
                    >
                      {reg.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-[#687788] p-3 border-t border-[#E2E8EF]">
          Source: IRDAI (Payment of Commission or Remuneration or Reward to Insurance Agents and Insurance
          Intermediaries) Regulations, 2023. Rates are subject to revision.
        </p>
      </div>
    </div>
  )
}
