import React from 'react'
import { Link } from 'react-router-dom'
import {
  Calculator,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  FileText,
} from 'lucide-react'

export const AssessmentsPage: React.FC = () => {
  const assessmentRecords = [
    {
      id: 'ASM-401',
      client: 'Rajesh Verma',
      income: '₹28 Lakh / yr',
      liabilities: '₹45 Lakh',
      existingCover: '₹50 Lakh',
      recommendedCover: '₹2.5 Crore',
      gap: '₹2.0 Crore',
      status: 'Quotation Generated',
      date: '16-Nov-2026',
    },
    {
      id: 'ASM-402',
      client: 'Ananya Iyer',
      income: '₹18 Lakh / yr',
      liabilities: '₹20 Lakh',
      existingCover: '₹0',
      recommendedCover: '₹1.5 Crore',
      gap: '₹1.5 Crore',
      status: 'Advisory Review',
      date: '15-Nov-2026',
    },
    {
      id: 'ASM-403',
      client: 'Suresh Patel',
      income: '₹12 Lakh / yr',
      liabilities: '₹15 Lakh',
      existingCover: '₹25 Lakh',
      recommendedCover: '₹1.0 Crore',
      gap: '₹75 Lakh',
      status: 'In Progress',
      date: '14-Nov-2026',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8EF]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#16856D]">
            Suitability & Underwriting Intake
          </span>
          <h1 className="text-2xl font-bold text-[#142D4E] font-['Manrope'] mt-0.5">
            Insurance Needs Assessment Logs
          </h1>
          <p className="text-xs text-[#687788]">
            Records of Human Life Value (HLV) calculations required under IRDAI broker suitability regulations.
          </p>
        </div>

        <Link
          to="/assessment"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#16856D] hover:bg-[#0F6B57] text-white text-xs font-semibold shadow-xs"
        >
          <Calculator className="w-4 h-4" />
          <span>Launch Assessment Calculator</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8EF] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9FB] border-b border-[#E2E8EF] text-[#687788]">
              <tr>
                <th className="py-3 px-4 font-semibold">Ref ID & Date</th>
                <th className="py-3 px-4 font-semibold">Client Name</th>
                <th className="py-3 px-4 font-semibold">Annual Income</th>
                <th className="py-3 px-4 font-semibold">Liabilities</th>
                <th className="py-3 px-4 font-semibold">Existing Cover</th>
                <th className="py-3 px-4 font-semibold">Recommended HLV</th>
                <th className="py-3 px-4 font-semibold">Coverage Shortfall</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8EF]">
              {assessmentRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-[#F7F9FB]/60 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-[#142D4E] block">{rec.id}</span>
                    <span className="text-[10px] text-[#687788]">{rec.date}</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#182536]">{rec.client}</td>
                  <td className="py-3 px-4">{rec.income}</td>
                  <td className="py-3 px-4 text-[#C44545] font-medium">{rec.liabilities}</td>
                  <td className="py-3 px-4 text-[#687788]">{rec.existingCover}</td>
                  <td className="py-3 px-4 font-bold text-[#142D4E]">{rec.recommendedCover}</td>
                  <td className="py-3 px-4 font-black text-[#16856D]">{rec.gap}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-semibold text-[#142D4E] bg-[#E9F1F5] px-2 py-0.5 rounded">
                      {rec.status}
                    </span>
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
