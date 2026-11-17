import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PRODUCTS_CATALOG, type ProductItem } from '../data/products'
import {
  Scale,
  ShieldCheck,
  Check,
  X,
  ArrowRight,
  Info,
  PhoneCall,
  Sparkles,
  FileSpreadsheet,
  HelpCircle,
  Calendar,
  FileText,
  AlertTriangle,
} from 'lucide-react'
import { EnquiryModal, type EnquiryType } from '../../../components/EnquiryModal'

export const ComparePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const p1 = searchParams.get('p1') || 'hdfc-click-2-protect'
  const p2 = searchParams.get('p2') || 'icici-iprotect-smart'
  const p3 = searchParams.get('p3') || 'sbi-e-shield-next'

  const [selectedP1, setSelectedP1] = useState<string>(p1)
  const [selectedP2, setSelectedP2] = useState<string>(p2)
  const [selectedP3, setSelectedP3] = useState<string>(p3)
  const [showSlot3, setShowSlot3] = useState<boolean>(true)

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<EnquiryType>('QUOTE_REQUEST')
  const [activePlan, setActivePlan] = useState<ProductItem | null>(null)

  const plan1 = PRODUCTS_CATALOG.find((p) => p.id === selectedP1) || PRODUCTS_CATALOG[0]
  const plan2 = PRODUCTS_CATALOG.find((p) => p.id === selectedP2) || PRODUCTS_CATALOG[1]
  const plan3 = PRODUCTS_CATALOG.find((p) => p.id === selectedP3) || PRODUCTS_CATALOG[2]

  const activePlans = showSlot3 ? [plan1, plan2, plan3] : [plan1, plan2]

  const todayDateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const comparisonRows = [
    {
      group: 'Carrier Standing & Statutory Regs',
      feature: 'Insurer & IRDAI Stature',
      render: (p: ProductItem) => (
        <div>
          <span className="font-bold text-[#142D4E] block">{p.insurer}</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[11px] text-[#16856D] font-semibold bg-[#E8F5F2] px-2 py-0.5 rounded">
              {p.claimSettlementRatio} CSR
            </span>
            <span className="text-[10px] text-[#687788] bg-[#F7F9FB] px-1.5 py-0.5 rounded border border-[#E2E8EF]">
              Solvency: 2.05x
            </span>
          </div>
        </div>
      ),
    },
    {
      group: 'Carrier Standing & Statutory Regs',
      feature: 'IRDAI UIN & Document Version',
      render: (p: ProductItem) => (
        <div>
          <span className="font-mono text-xs text-[#142D4E] block font-semibold">{p.uinNumber}</span>
          <span className="text-[10px] text-[#687788] block mt-0.5">
            Specimen Doc: {p.version} (Filing: 2026.1)
          </span>
        </div>
      ),
    },
    {
      group: 'Premium & Coverage Specs',
      feature: 'Coverage Sum Assured',
      render: (p: ProductItem) => (
        <div>
          <span className="font-bold text-[#142D4E] text-sm block">{p.indicativeSumAssured}</span>
          <span className="text-[10px] text-[#687788]">Customizable up to ₹25 Crore</span>
        </div>
      ),
    },
    {
      group: 'Premium & Coverage Specs',
      feature: 'Indicative Monthly Premium (1 Cr)',
      render: (p: ProductItem) => (
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-[#142D4E] font-['Manrope']">
              ₹{p.startingPremiumMonthly.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-[#687788]">/ month</span>
          </div>
          <span className="inline-block mt-1 text-[9px] font-semibold text-[#C58A36] bg-[#FFFBEB] px-1.5 py-0.5 rounded border border-[#C58A36]/30 uppercase">
            Illustrative Sample Data
          </span>
        </div>
      ),
    },
    {
      group: 'Tenure & Terms',
      feature: 'Maximum Coverage Age',
      render: (p: ProductItem) => (
        <div>
          <span className="text-xs font-bold text-[#182536] block">{p.maturityAge}</span>
          <span className="text-[10px] text-[#687788]">Policy term: {p.policyTerm}</span>
        </div>
      ),
    },
    {
      group: 'Tenure & Terms',
      feature: 'Premium Payment Term (PPT)',
      render: (p: ProductItem) => (
        <div>
          <span className="text-xs font-semibold text-[#182536] block">{p.premiumPaymentTerm}</span>
          <span className="text-[10px] text-[#16856D]">Option to pay till 60 and cover till 85</span>
        </div>
      ),
    },
    {
      group: 'Benefits & Riders',
      feature: 'Core Policy Benefits',
      render: (p: ProductItem) => (
        <ul className="space-y-1.5 text-xs text-[#182536]">
          {p.keyBenefits.map((b, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#16856D] mt-0.5 shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      group: 'Benefits & Riders',
      feature: 'Available Add-On Riders',
      render: (p: ProductItem) => (
        <div className="space-y-1">
          {p.ridersAvailable.map((r, i) => (
            <div key={i} className="inline-flex items-center gap-1.5 text-[11px] text-[#16856D] font-medium bg-[#E8F5F2] px-2 py-0.5 rounded mr-1 mb-1">
              <Check className="w-3 h-3 text-[#16856D]" />
              <span>{r}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      group: 'Exclusions & Important Conditions',
      feature: 'Key Statutory Exclusions',
      render: (p: ProductItem) => (
        <div className="space-y-1 bg-[#FDF2F2] p-2.5 rounded-lg border border-[#C44545]/20 text-[11px] text-[#C44545]">
          <div className="flex items-center gap-1 font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Non-payable clauses:</span>
          </div>
          {p.exclusions.map((e, i) => (
            <p key={i} className="leading-tight">• {e}</p>
          ))}
        </div>
      ),
    },
    {
      group: 'Exclusions & Important Conditions',
      feature: 'Eligibility Requirements',
      render: (p: ProductItem) => (
        <div className="text-xs space-y-0.5">
          <p><strong className="text-[#142D4E]">Entry Age:</strong> {p.entryAge}</p>
          <p><strong className="text-[#142D4E]">Max Maturity:</strong> {p.maturityAge}</p>
          <p><strong className="text-[#142D4E]">Min Income:</strong> ₹4 Lakh/yr</p>
        </div>
      ),
    },
    {
      group: 'Exclusions & Important Conditions',
      feature: 'Statutory Conditions',
      render: () => (
        <div className="text-[11px] text-[#687788] space-y-1">
          <p>• <strong>Free-Look:</strong> 30 Days from electronic policy delivery.</p>
          <p>• <strong>Grace Period:</strong> 30 Days for annual/half-yearly modes.</p>
          <p>• <strong>Section 45:</strong> Incontestable after 3 continuous active policy years.</p>
        </div>
      ),
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8EF] pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-[#16856D] font-semibold uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            <span>Multi-Insurer Comparison Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#142D4E] font-['Manrope']">
            Compare Life Insurance Policies Side-by-Side
          </h1>
          <p className="text-sm text-[#687788] max-w-2xl">
            Evaluate official policy terms, Claim Settlement Ratios, exclusions, and illustrative premiums side-by-side. Quotations dated: <strong>{todayDateStr}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActivePlan(null)
              setModalType('SAVE_COMPARISON')
              setModalOpen(true)
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E2E8EF] bg-white hover:bg-[#F7F9FB] text-xs font-semibold text-[#142D4E] transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#16856D]" />
            <span>Email Comparison</span>
          </button>
          <button
            onClick={() => {
              setActivePlan(null)
              setModalType('QUESTION')
              setModalOpen(true)
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-xs font-semibold text-white transition-colors shadow-xs"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Ask a Specialist</span>
          </button>
        </div>
      </div>

      {/* Comparison Selector Dropdowns */}
      <div className="bg-white rounded-xl border border-[#E2E8EF] p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-[#142D4E]">
          <span>Select Products to Compare (2 or 3 Plans)</span>
          <button
            onClick={() => setShowSlot3(!showSlot3)}
            className="text-xs text-[#16856D] hover:underline"
          >
            {showSlot3 ? '– Remove 3rd Slot' : '+ Add 3rd Plan to Compare'}
          </button>
        </div>

        <div className={`grid grid-cols-1 ${showSlot3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
          <div>
            <label className="block text-xs font-semibold text-[#182536] mb-1">Plan 1</label>
            <select
              value={selectedP1}
              onChange={(e) => setSelectedP1(e.target.value)}
              className="w-full h-10 px-3 text-xs rounded-lg border border-[#E2E8EF] bg-[#F7F9FB] text-[#182536] font-medium focus:outline-hidden focus:border-[#142D4E]"
            >
              {PRODUCTS_CATALOG.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.insurer} — {p.name} ({p.categoryLabel})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#182536] mb-1">Plan 2</label>
            <select
              value={selectedP2}
              onChange={(e) => setSelectedP2(e.target.value)}
              className="w-full h-10 px-3 text-xs rounded-lg border border-[#E2E8EF] bg-[#F7F9FB] text-[#182536] font-medium focus:outline-hidden focus:border-[#142D4E]"
            >
              {PRODUCTS_CATALOG.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.insurer} — {p.name} ({p.categoryLabel})
                </option>
              ))}
            </select>
          </div>

          {showSlot3 && (
            <div>
              <label className="block text-xs font-semibold text-[#182536] mb-1">Plan 3</label>
              <select
                value={selectedP3}
                onChange={(e) => setSelectedP3(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-lg border border-[#E2E8EF] bg-[#F7F9FB] text-[#182536] font-medium focus:outline-hidden focus:border-[#142D4E]"
              >
                {PRODUCTS_CATALOG.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.insurer} — {p.name} ({p.categoryLabel})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8EF] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#E2E8EF] bg-[#F7F9FB]">
                <th className="p-4 sm:p-6 w-1/4 text-xs font-bold uppercase tracking-wider text-[#687788]">
                  Comparison Matrix
                </th>
                {activePlans.map((p) => (
                  <th key={p.id} className="p-4 sm:p-6 text-sm font-bold text-[#142D4E] font-['Manrope']">
                    <span className="block text-xs font-normal text-[#687788]">{p.insurer}</span>
                    <span className="text-base">{p.name}</span>
                    <span className="block text-[11px] font-normal text-[#16856D] mt-0.5">
                      {p.categoryLabel}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8EF]">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#F7F9FB]/50 transition-colors">
                  <td className="p-4 sm:p-5 text-xs font-bold text-[#182536] bg-[#F7F9FB]/30 align-top">
                    <span className="text-[10px] text-[#687788] block uppercase tracking-wider">
                      {row.group}
                    </span>
                    <span className="text-xs font-bold text-[#142D4E] block mt-0.5">
                      {row.feature}
                    </span>
                  </td>
                  {activePlans.map((p) => (
                    <td key={p.id} className="p-4 sm:p-5 text-xs align-top">
                      {row.render(p)}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Action row */}
              <tr className="bg-[#F7F9FB] border-t-2 border-[#142D4E]">
                <td className="p-4 sm:p-5 text-xs font-bold text-[#142D4E] align-middle">
                  Take Next Action
                </td>
                {activePlans.map((p) => (
                  <td key={p.id} className="p-4 sm:p-5 space-y-2">
                    <button
                      onClick={() => {
                        setActivePlan(p)
                        setModalType('QUOTE_REQUEST')
                        setModalOpen(true)
                      }}
                      className="w-full py-2.5 px-3 rounded-lg bg-[#16856D] hover:bg-[#0F6B57] text-white text-xs font-semibold transition-colors shadow-2xs block text-center"
                    >
                      Request Quote for {p.name.split(' ')[0]}
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setActivePlan(p)
                          setModalType('CALLBACK_REQUEST')
                          setModalOpen(true)
                        }}
                        className="py-1.5 px-2 rounded-lg border border-[#E2E8EF] bg-white hover:bg-[#F7F9FB] text-[11px] font-semibold text-[#142D4E] transition-colors"
                      >
                        Request Callback
                      </button>
                      <Link
                        to={`/insurance/${p.id}`}
                        className="py-1.5 px-2 rounded-lg border border-[#E2E8EF] bg-white hover:bg-[#F7F9FB] text-[11px] font-semibold text-[#687788] hover:text-[#142D4E] transition-colors text-center"
                      >
                        Full Details
                      </Link>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Statutory Regulatory Notice */}
      <div className="p-4 rounded-xl bg-white border border-[#E2E8EF] text-xs text-[#687788] flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-[#16856D] shrink-0" />
        <p>
          <strong>Statutory Compliance & Transparent Pricing:</strong> Quotations dated {todayDateStr}. Premium estimates are indicative demo figures reflecting standard mortality tables. Actual premiums and underwriting approvals are determined exclusively by official insurer systems upon full medical disclosure and document verification.
        </p>
      </div>

      {/* Enquiry Modal */}
      <EnquiryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        enquiryType={modalType}
        productName={activePlan?.name || `${plan1.name} vs ${plan2.name}`}
        insurerName={activePlan?.insurer || 'Authorised Partner Carriers'}
        productId={activePlan?.id}
        productIds={activePlans.map((p) => p.id)}
        desiredSumAssured={10000000}
      />
    </div>
  )
}
