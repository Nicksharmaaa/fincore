import React from 'react'
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Users,
  Building2,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react'

export const AnalyticsPage: React.FC = () => {
  const funnelStages = [
    { stage: '1. Inbound Leads', count: 142, rate: '100%' },
    { stage: '2. Needs Assessment Completed', count: 98, rate: '69.0%' },
    { stage: '3. Multi-Insurer Quotation Generated', count: 64, rate: '45.1%' },
    { stage: '4. Proposal Forwarded to Insurer', count: 32, rate: '22.5%' },
    { stage: '5. Policy Issued by Insurer', count: 24, rate: '16.9%' },
  ]

  const insurerShare = [
    { name: 'HDFC Life', share: '36%', volume: '₹14.2 Cr' },
    { name: 'ICICI Prudential', share: '28%', volume: '₹11.0 Cr' },
    { name: 'SBI Life', share: '18%', volume: '₹7.1 Cr' },
    { name: 'Max Life', share: '12%', volume: '₹4.8 Cr' },
    { name: 'LIC of India', share: '6%', volume: '₹2.4 Cr' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8EF]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#16856D]">
            Executive Business Intelligence
          </span>
          <h1 className="text-2xl font-bold text-[#142D4E] font-['Manrope'] mt-0.5">
            Sales & Operational Analytics
          </h1>
          <p className="text-xs text-[#687788]">
            Conversion funnels, multi-insurer volume distribution, and regulated brokerage revenue pipeline.
          </p>
        </div>
      </div>

      {/* KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#E2E8EF] p-5 shadow-xs">
          <span className="text-xs font-medium text-[#687788]">Overall Conversion Rate</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#142D4E] font-['Manrope']">16.9%</span>
            <span className="text-xs font-semibold text-[#16856D] flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +2.4% MoM
            </span>
          </div>
          <p className="text-[11px] text-[#687788] mt-1">Lead to verified policy issuance</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8EF] p-5 shadow-xs">
          <span className="text-xs font-medium text-[#687788]">Total Sum Assured Placed</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#16856D] font-['Manrope']">₹39.5 Cr</span>
            <span className="text-xs font-semibold text-[#16856D] flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14% vs Q3
            </span>
          </div>
          <p className="text-[11px] text-[#687788] mt-1">Across 24 active policies</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8EF] p-5 shadow-xs">
          <span className="text-xs font-medium text-[#687788]">Brokerage Commission Pipeline</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#142D4E] font-['Manrope']">₹4.82 Lakh</span>
            <span className="text-xs font-semibold text-[#687788]">Pending settlement</span>
          </div>
          <p className="text-[11px] text-[#687788] mt-1">Under IRDAI Commission Regs 2023</p>
        </div>
      </div>

      {/* Funnel & Insurer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Conversion Funnel */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E2E8EF] p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#142D4E] font-['Manrope']">
            Conversion Funnel Analysis (MTD)
          </h3>
          <div className="space-y-3 pt-2">
            {funnelStages.map((stage, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-[#182536]">
                  <span>{stage.stage}</span>
                  <span>
                    {stage.count} leads ({stage.rate})
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#E9F1F5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#142D4E] rounded-full transition-all"
                    style={{ width: stage.rate }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insurer Share */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E2E8EF] p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#142D4E] font-['Manrope']">
            Volume Placed by Insurer Partner
          </h3>
          <div className="space-y-3 pt-1">
            {insurerShare.map((ins, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-[#E2E8EF] bg-[#F7F9FB] flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-[#182536] block">{ins.name}</span>
                  <span className="text-[10px] text-[#687788]">{ins.volume} cover placed</span>
                </div>
                <span className="text-sm font-black text-[#16856D] font-['Manrope']">
                  {ins.share}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
