import React from 'react'
import { PRODUCTS_CATALOG } from '../../customer/data/products'
import {
  ShieldCheck,
  Search,
  Filter,
  Plus,
  Clock,
  Sparkles,
  FileCheck2,
} from 'lucide-react'

export const ProductsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8EF]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#16856D]">
            Product Catalog Administration
          </span>
          <h1 className="text-2xl font-bold text-[#142D4E] font-['Manrope'] mt-0.5">
            Version-Controlled Policy Registry
          </h1>
          <p className="text-xs text-[#687788]">
            Product definitions must be versioned with IRDAI filing references and effective validity dates.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8EF] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9FB] border-b border-[#E2E8EF] text-[#687788]">
              <tr>
                <th className="py-3 px-4 font-semibold">Product Name</th>
                <th className="py-3 px-4 font-semibold">Insurer Partner</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Active Version</th>
                <th className="py-3 px-4 font-semibold">Effective Since</th>
                <th className="py-3 px-4 font-semibold">Starting Premium</th>
                <th className="py-3 px-4 font-semibold">Riders Count</th>
                <th className="py-3 px-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8EF]">
              {PRODUCTS_CATALOG.map((p) => (
                <tr key={p.id} className="hover:bg-[#F7F9FB]/60 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-bold text-[#182536] block">{p.name}</span>
                    <span className="text-[10px] text-[#687788] font-mono">{p.id}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-[#182536]">{p.insurer}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-semibold text-[#142D4E] bg-[#E9F1F5] px-2 py-0.5 rounded">
                      {p.categoryLabel}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#16856D]">
                    {p.version}
                  </td>
                  <td className="py-3 px-4 text-[#687788]">{p.effectiveDate}</td>
                  <td className="py-3 px-4 font-bold text-[#142D4E]">
                    ₹{p.startingPremiumMonthly.toLocaleString('en-IN')} / mo
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#182536]">
                    {p.ridersAvailable.length} Riders
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-[10px] font-bold text-[#16856D] bg-[#E8F5F2] px-2 py-0.5 rounded">
                      Current
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
