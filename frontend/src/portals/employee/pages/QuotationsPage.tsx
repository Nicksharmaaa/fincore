import React, { useState } from 'react'
import {
  FileText,
  Search,
  Filter,
  Plus,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'

interface QuoteRecord {
  id: string
  client: string
  insurer: string
  product: string
  sumAssured: string
  indicativePremium: string
  isDemo: boolean
  status: 'Draft' | 'Sent to Client' | 'Accepted' | 'Expired'
  validUntil: string
}

const QUOTES_DATA: QuoteRecord[] = [
  {
    id: 'QT-9011',
    client: 'Rajesh Verma',
    insurer: 'HDFC Life',
    product: 'Click 2 Protect Super (v4.2)',
    sumAssured: '₹1.5 Crore',
    indicativePremium: '₹1,120 / month',
    isDemo: true,
    status: 'Sent to Client',
    validUntil: '30-Nov-2026',
  },
  {
    id: 'QT-9012',
    client: 'Ananya Iyer',
    insurer: 'ICICI Prudential',
    product: 'iProtect Smart (v3.8)',
    sumAssured: '₹1.0 Crore',
    indicativePremium: '₹810 / month',
    isDemo: true,
    status: 'Accepted',
    validUntil: '28-Nov-2026',
  },
  {
    id: 'QT-9013',
    client: 'Suresh Patel',
    insurer: 'SBI Life',
    product: 'eShield Next (v2.1)',
    sumAssured: '₹75 Lakh',
    indicativePremium: '₹580 / month',
    isDemo: true,
    status: 'Draft',
    validUntil: '05-Dec-2026',
  },
  {
    id: 'QT-9014',
    client: 'Deepak Joshi',
    insurer: 'LIC of India',
    product: 'Tech Term Plan 854',
    sumAssured: '₹2.0 Crore',
    indicativePremium: '₹1,780 / month',
    isDemo: true,
    status: 'Accepted',
    validUntil: '20-Nov-2026',
  },
]

export const QuotationsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8EF]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#16856D]">
            Multi-Insurer Quotation Manager
          </span>
          <h1 className="text-2xl font-bold text-[#142D4E] font-['Manrope'] mt-0.5">
            Indicative Quotations & Proposals
          </h1>
          <p className="text-xs text-[#687788]">
            Proposals generated across partner life insurers. Quotes originate from official rate cards or clearly labelled demo data.
          </p>
        </div>

        <button
          onClick={() => alert('New Quotation Wizard: Select Lead and Insurers to aggregate comparison quotes.')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Quotation</span>
        </button>
      </div>

      {/* Mandatory Regulatory Compliance Notice */}
      <div className="p-4 rounded-xl bg-[#FDF7EE] border border-[#C58A36]/30 text-xs text-[#C58A36] flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#C58A36]" />
        <div>
          <span className="font-bold text-[#182536] block">
            Compliance Policy Notice: Indicative Quotations
          </span>
          <p className="text-[11px] text-[#687788] mt-0.5">
            Do not represent these figures as binding insurer approvals. Binding premiums, underwriting loadings, and terms are determined strictly by authorised insurance company systems post tele-medical appraisal.
          </p>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-xl border border-[#E2E8EF] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9FB] border-b border-[#E2E8EF] text-[#687788]">
              <tr>
                <th className="py-3 px-4 font-semibold">Quote Ref</th>
                <th className="py-3 px-4 font-semibold">Client Name</th>
                <th className="py-3 px-4 font-semibold">Insurer Partner</th>
                <th className="py-3 px-4 font-semibold">Product Name</th>
                <th className="py-3 px-4 font-semibold">Sum Assured</th>
                <th className="py-3 px-4 font-semibold">Indicative Premium</th>
                <th className="py-3 px-4 font-semibold">Data Origin</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8EF]">
              {QUOTES_DATA.map((q) => (
                <tr key={q.id} className="hover:bg-[#F7F9FB]/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#142D4E]">{q.id}</td>
                  <td className="py-3 px-4 font-bold text-[#182536]">{q.client}</td>
                  <td className="py-3 px-4 text-[#182536] font-medium">{q.insurer}</td>
                  <td className="py-3 px-4">{q.product}</td>
                  <td className="py-3 px-4 font-bold text-[#142D4E]">{q.sumAssured}</td>
                  <td className="py-3 px-4 font-black text-[#16856D]">{q.indicativePremium}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-semibold text-[#687788] bg-[#F7F9FB] border border-[#E2E8EF] px-1.5 py-0.5 rounded">
                      Demo Rate Card
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        q.status === 'Accepted'
                          ? 'bg-[#E8F5F2] text-[#16856D]'
                          : q.status === 'Sent to Client'
                          ? 'bg-[#E9F1F5] text-[#142D4E]'
                          : 'bg-[#FDF7EE] text-[#C58A36]'
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => alert(`Sharing quotation PDF with ${q.client}`)}
                      className="px-2 py-1 text-[11px] font-semibold rounded bg-[#142D4E] text-white hover:bg-[#1D3D5C]"
                    >
                      Share PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
