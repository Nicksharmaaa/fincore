import React, { useState, useEffect } from 'react'
import { PackageSearch } from 'lucide-react'

const IS_DEMO = true

const DemoBadge = () =>
  IS_DEMO ? (
    <span className="text-[10px] font-bold text-[#C58A36] bg-[#FDF7EE] border border-[#C58A36]/20 px-1.5 py-0.5 rounded">
      DEMO DATA
    </span>
  ) : null

type Category = 'All' | 'Term Plans' | 'Whole Life' | 'ULIPs' | 'Savings/Endowment' | 'Annuity'

interface ProductRow {
  product: string
  insurer: string
  category: Category
  enquiries: number
  quotes: number
  applications: number
  policies: number
  conversionPct: number
}

const SEED_PRODUCTS: ProductRow[] = [
  { product: 'Click 2 Protect Super', insurer: 'HDFC Life', category: 'Term Plans', enquiries: 88, quotes: 62, applications: 32, policies: 22, conversionPct: 25.0 },
  { product: 'iProtect Smart', insurer: 'ICICI Prudential', category: 'Term Plans', enquiries: 76, quotes: 54, applications: 28, policies: 19, conversionPct: 25.0 },
  { product: 'Smart Wealth Goal', insurer: 'Max Life', category: 'ULIPs', enquiries: 64, quotes: 44, applications: 20, policies: 12, conversionPct: 18.75 },
  { product: 'eShield Next', insurer: 'SBI Life', category: 'Term Plans', enquiries: 58, quotes: 38, applications: 18, policies: 12, conversionPct: 20.69 },
  { product: 'Tech Term', insurer: 'LIC of India', category: 'Term Plans', enquiries: 42, quotes: 28, applications: 14, policies: 9, conversionPct: 21.43 },
  { product: 'Sampoorna Raksha Supreme', insurer: 'Tata AIA Life', category: 'Term Plans', enquiries: 36, quotes: 24, applications: 10, policies: 6, conversionPct: 16.67 },
  { product: 'Fortune Builder', insurer: 'HDFC Life', category: 'ULIPs', enquiries: 32, quotes: 20, applications: 8, policies: 4, conversionPct: 12.5 },
  { product: 'New Endowment Plan', insurer: 'LIC of India', category: 'Savings/Endowment', enquiries: 28, quotes: 18, applications: 8, policies: 5, conversionPct: 17.86 },
  { product: 'Jeevan Akshay VII', insurer: 'LIC of India', category: 'Annuity', enquiries: 18, quotes: 12, applications: 6, policies: 4, conversionPct: 22.22 },
  { product: 'Whole Life Secure', insurer: 'Max Life', category: 'Whole Life', enquiries: 14, quotes: 8, applications: 4, policies: 2, conversionPct: 14.29 },
]

const GAP_ANALYSIS = [
  { category: 'ULIPs', quoteRequested: 64, applicationSubmitted: 28, dropOffPct: 56.3 },
  { category: 'Savings/Endowment', quoteRequested: 46, applicationSubmitted: 20, dropOffPct: 56.5 },
  { category: 'Whole Life', quoteRequested: 22, applicationSubmitted: 8, dropOffPct: 63.6 },
  { category: 'Term Plans', quoteRequested: 186, applicationSubmitted: 102, dropOffPct: 45.2 },
  { category: 'Annuity', quoteRequested: 20, applicationSubmitted: 10, dropOffPct: 50.0 },
]

const CATEGORIES: Category[] = ['All', 'Term Plans', 'Whole Life', 'ULIPs', 'Savings/Endowment', 'Annuity']

export const ProductAnalyticsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductRow[]>(SEED_PRODUCTS)
  const [activeCategory, setActiveCategory] = useState<Category>('All')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    fetch('/api/v1/analytics/product-performance', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (Array.isArray(data) && data.length > 0) setProducts(data) })
      .catch(() => {})
  }, [])

  const filtered = activeCategory === 'All' ? products : products.filter((p) => p.category === activeCategory)
  const sorted = [...filtered].sort((a, b) => b.enquiries - a.enquiries)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8EF]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#16856D]">
            Product Intelligence
          </span>
          <h1 className="text-2xl font-bold text-[#142D4E] font-['Manrope'] mt-0.5">
            Product Intelligence
          </h1>
          <p className="text-xs text-[#687788] mt-0.5">
            Product-level enquiry, quotation, and conversion performance across all categories.
          </p>
        </div>
        <PackageSearch className="w-8 h-8 text-[#E2E8EF] shrink-0" />
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              activeCategory === cat
                ? 'bg-[#142D4E] text-white border-[#142D4E]'
                : 'bg-white text-[#687788] border-[#E2E8EF] hover:border-[#142D4E] hover:text-[#142D4E]'
            }`}
          >
            {cat}
          </button>
        ))}
        <div className="ml-auto">
          <DemoBadge />
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl border border-[#E2E8EF] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#F7F9FB] border-b border-[#E2E8EF]">
              <tr>
                <th className="py-2.5 px-3 text-left font-semibold text-[#687788]">Product</th>
                <th className="py-2.5 px-3 text-left font-semibold text-[#687788]">Insurer</th>
                <th className="py-2.5 px-3 text-left font-semibold text-[#687788]">Category</th>
                <th className="py-2.5 px-3 text-center font-semibold text-[#687788]">Enquiries</th>
                <th className="py-2.5 px-3 text-center font-semibold text-[#687788]">Quotes</th>
                <th className="py-2.5 px-3 text-center font-semibold text-[#687788]">Applications</th>
                <th className="py-2.5 px-3 text-center font-semibold text-[#687788]">Policies</th>
                <th className="py-2.5 px-3 text-left font-semibold text-[#687788] min-w-[120px]">Conv%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8EF]">
              {sorted.map((p, i) => {
                const barWidth = Math.round(p.conversionPct * 3)
                return (
                  <tr key={i} className="hover:bg-[#F7F9FB] transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[#182536]">{p.product}</td>
                    <td className="py-2.5 px-3 text-[#687788]">{p.insurer}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-bold text-[#142D4E] bg-[#E9F1F5] px-1.5 py-0.5 rounded">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-[#182536]">{p.enquiries}</td>
                    <td className="py-2.5 px-3 text-center text-[#182536]">{p.quotes}</td>
                    <td className="py-2.5 px-3 text-center text-[#182536]">{p.applications}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-[#16856D]">{p.policies}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-[#E9F1F5] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#16856D] rounded-full"
                            style={{ width: `${Math.min(barWidth, 100)}%` }}
                          />
                        </div>
                        <span
                          className={`font-bold w-10 text-right ${
                            p.conversionPct >= 20
                              ? 'text-[#16856D]'
                              : p.conversionPct >= 10
                              ? 'text-[#C58A36]'
                              : 'text-[#C44545]'
                          }`}
                        >
                          {p.conversionPct.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coverage Gap Analysis */}
      <div className="bg-white rounded-xl border border-[#E2E8EF] shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-[#E2E8EF]">
          <h2 className="text-sm font-bold text-[#142D4E] font-['Manrope']">Coverage Gap Analysis</h2>
          <span className="text-[10px] text-[#687788]">Quote Requested → Application Submitted drop-off</span>
          <DemoBadge />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#F7F9FB] border-b border-[#E2E8EF]">
              <tr>
                <th className="py-2.5 px-3 text-left font-semibold text-[#687788]">Product Category</th>
                <th className="py-2.5 px-3 text-center font-semibold text-[#687788]">Quote Requested</th>
                <th className="py-2.5 px-3 text-center font-semibold text-[#687788]">Application Submitted</th>
                <th className="py-2.5 px-3 text-center font-semibold text-[#C44545]">Drop-off %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8EF]">
              {[...GAP_ANALYSIS].sort((a, b) => b.dropOffPct - a.dropOffPct).map((g, i) => (
                <tr key={i} className="hover:bg-[#F7F9FB]">
                  <td className="py-2.5 px-3 font-semibold text-[#182536]">{g.category}</td>
                  <td className="py-2.5 px-3 text-center text-[#182536]">{g.quoteRequested}</td>
                  <td className="py-2.5 px-3 text-center text-[#182536]">{g.applicationSubmitted}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-[#C44545]">
                    {g.dropOffPct.toFixed(1)}%
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
