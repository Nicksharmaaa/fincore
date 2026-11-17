import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { PRODUCTS_CATALOG, type SpecimenDocument } from '../data/products'
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  PhoneCall,
  Scale,
  Check,
  Download,
  Eye,
  X,
  Building,
  Info,
  Calendar,
  Lock,
  UserCheck,
} from 'lucide-react'
import { submitCustomerEnquiryAPI, type CustomerEnquiryResult } from '../../../services/api'
import { EnquiryModal, type EnquiryType } from '../../../components/EnquiryModal'

export const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()

  const [quoteRequested, setQuoteRequested] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionReceipt, setSubmissionReceipt] = useState<CustomerEnquiryResult | null>(null)
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [activeDocModal, setActiveDocModal] = useState<SpecimenDocument | null>(null)

  // Enquiry Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<EnquiryType>('CALLBACK_REQUEST')

  const product = PRODUCTS_CATALOG.find((p) => p.id === productId)

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#142D4E] font-['Manrope']">
          Policy Specification Not Found
        </h2>
        <p className="text-sm text-[#687788]">
          The policy product identifier <code className="bg-[#E9F1F5] px-1.5 py-0.5 rounded text-xs">{productId}</code> is either unlisted or retired in the current catalogue.
        </p>
        <Link
          to="/insurance"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#142D4E] text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Product Catalogue</span>
        </Link>
      </div>
    )
  }

  const handleRequestQuote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactName.trim() || !contactPhone.trim()) return

    setIsSubmitting(true)
    try {
      const res = await submitCustomerEnquiryAPI({
        customer_name: contactName.trim(),
        customer_email: contactEmail.trim() || `${contactPhone}@fincore.customer`,
        customer_phone: contactPhone.trim(),
        enquiry_type: 'QUOTE_REQUEST',
        product_id: product.id,
        product_interest: `${product.name} (${product.insurer})`,
        desired_sum_assured: 10000000,
        consent_given: true,
        lead_source: 'WEBSITE_PRODUCT_DETAIL',
      })
      setSubmissionReceipt(res)
      setQuoteRequested(true)
    } catch (err) {
      console.error('Quote submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. Breadcrumb navigation */}
      <div className="flex items-center gap-2 text-xs text-[#687788]">
        <Link to="/insurance" className="hover:text-[#142D4E] flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Catalogue</span>
        </Link>
        <span>/</span>
        <Link to={`/insurance?category=${product.category}`} className="hover:text-[#142D4E]">
          {product.categoryLabel}
        </Link>
        <span>/</span>
        <span>{product.insurer}</span>
        <span>/</span>
        <span className="text-[#182536] font-semibold">{product.name}</span>
      </div>

      {/* 2. Hero Product Summary Banner */}
      <div className="bg-white rounded-2xl border border-[#E2E8EF] p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Top Demo Tag */}
        {product.isDemoData && (
          <div className="absolute top-4 right-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C58A36] bg-[#FFF8EE] border border-[#C58A36]/30 px-2 py-0.5 rounded">
              Demo Data Specification
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2 pr-28">
              <span className="text-xs font-bold text-[#142D4E] bg-[#E9F1F5] px-2.5 py-1 rounded">
                {product.insurer}
              </span>
              <span className="text-xs font-semibold text-[#16856D] bg-[#E8F5F2] px-2.5 py-1 rounded">
                {product.claimSettlementRatio} CSR (IRDAI)
              </span>
              <span className="text-[11px] font-mono font-medium text-[#687788] border border-[#E2E8EF] px-2 py-0.5 rounded">
                UIN: {product.uinNumber}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#142D4E] font-['Manrope']">
              {product.name}
            </h1>

            <p className="text-base text-[#687788] leading-relaxed max-w-2xl">
              {product.description}
            </p>

            {/* Quick eligibility specs bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#E2E8EF] text-xs">
              <div>
                <span className="text-[#687788] block">Entry Age</span>
                <span className="font-semibold text-[#182536] mt-0.5 block">{product.entryAge}</span>
              </div>
              <div>
                <span className="text-[#687788] block">Maturity Age</span>
                <span className="font-semibold text-[#182536] mt-0.5 block">{product.maturityAge}</span>
              </div>
              <div>
                <span className="text-[#687788] block">Policy Term</span>
                <span className="font-semibold text-[#182536] mt-0.5 block">{product.policyTerm}</span>
              </div>
              <div>
                <span className="text-[#687788] block">Premium Payment Term</span>
                <span className="font-semibold text-[#182536] mt-0.5 block">{product.premiumPaymentTerm}</span>
              </div>
            </div>
          </div>

          {/* Quick Quote / Consultation Request Box */}
          <div className="lg:col-span-4 bg-[#F7F9FB] rounded-xl border border-[#E2E8EF] p-6 space-y-4">
            <div>
              <span className="text-[11px] font-semibold text-[#687788] uppercase tracking-wider block">
                Indicative Benchmark Rate &bull; Demo data
              </span>
              <span className="text-3xl font-black text-[#142D4E] font-['Manrope']">
                ₹{product.startingPremiumMonthly.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-normal text-[#687788]">/ month</span>
              </span>
              <p className="text-xs text-[#16856D] mt-0.5 font-semibold">
                For {product.indicativeSumAssured} coverage (30-year healthy non-smoker)
              </p>
            </div>

            {quoteRequested && submissionReceipt ? (
              <div className="p-4 rounded-lg bg-[#E8F5F2] border border-[#16856D]/30 space-y-3">
                <div className="flex items-center gap-2 text-[#16856D] text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Official Quote Request Registered</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[#E2E8EF] text-xs">
                  <span className="text-[10px] text-[#687788] block uppercase font-bold">Lead Reference ID</span>
                  <span className="font-mono font-bold text-[#142D4E] text-sm">{submissionReceipt.lead_number}</span>
                </div>
                <div className="text-xs text-[#182536] flex items-start gap-2">
                  <UserCheck className="w-4 h-4 text-[#16856D] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Assigned Advisor: {submissionReceipt.assigned_advisor.name}</span>
                    <span className="text-[#687788] text-[11px]">Will reach out within 2 business hours with carrier rate card.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQuoteRequested(false)}
                  className="text-[11px] text-[#142D4E] underline font-medium block pt-1"
                >
                  Request another quote
                </button>
              </div>
            ) : (
              <form onSubmit={handleRequestQuote} className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#182536] mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Vikram Sharma"
                    className="w-full h-8 px-3 text-xs rounded-lg border border-[#E2E8EF] bg-white text-[#182536] focus:outline-hidden focus:border-[#142D4E]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#182536] mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full h-8 px-3 text-xs rounded-lg border border-[#E2E8EF] bg-white text-[#182536] focus:outline-hidden focus:border-[#142D4E]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#182536] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="vikram@example.com"
                    className="w-full h-8 px-3 text-xs rounded-lg border border-[#E2E8EF] bg-white text-[#182536] focus:outline-hidden focus:border-[#142D4E]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-lg bg-[#16856D] hover:bg-[#0F6B57] text-white text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting to Backend...</span>
                    </>
                  ) : (
                    <>
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Request Official Insurer Quote</span>
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="pt-2 border-t border-[#E2E8EF] flex items-center justify-between text-xs">
              <Link
                to={`/compare?p1=${product.id}`}
                className="text-[#142D4E] hover:underline font-semibold inline-flex items-center gap-1"
              >
                <Scale className="w-3.5 h-3.5 text-[#16856D]" />
                <span>Compare side-by-side</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Deep Dive Sections: Core Features, Riders, Exclusions, Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Features, Coverage, Riders, Exclusions */}
        <div className="lg:col-span-8 space-y-8">
          {/* Policy Features & Benefits */}
          <div className="bg-white rounded-xl border border-[#E2E8EF] p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#142D4E] font-['Manrope']">
              Core Policy Features & Payout Mechanics
            </h2>
            <div className="space-y-3">
              {product.keyBenefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-[#182536]">
                  <CheckCircle2 className="w-4 h-4 text-[#16856D] flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Eligibility Requirements & Documentation */}
          <div className="bg-white rounded-xl border border-[#E2E8EF] p-6 space-y-3">
            <h2 className="text-lg font-bold text-[#142D4E] font-['Manrope']">
              Eligibility & Underwriting Criteria
            </h2>
            <p className="text-xs text-[#687788] leading-relaxed">
              {product.eligibilityNotes}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-[#F7F9FB] border border-[#E2E8EF]">
                <span className="text-[10px] uppercase font-bold text-[#687788] block">Identity</span>
                <span className="font-semibold text-[#182536]">PAN Card + Aadhaar</span>
              </div>
              <div className="p-3 rounded-lg bg-[#F7F9FB] border border-[#E2E8EF]">
                <span className="text-[10px] uppercase font-bold text-[#687788] block">Income Proof</span>
                <span className="font-semibold text-[#182536]">3 Months Salary / 2 Yr ITR</span>
              </div>
              <div className="p-3 rounded-lg bg-[#F7F9FB] border border-[#E2E8EF]">
                <span className="text-[10px] uppercase font-bold text-[#687788] block">Medical Check</span>
                <span className="font-semibold text-[#182536]">Tele-medical / Home sample</span>
              </div>
            </div>
          </div>

          {/* Optional Add-on Riders */}
          <div className="bg-white rounded-xl border border-[#E2E8EF] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#142D4E] font-['Manrope']">
                  Available Add-on Riders
                </h2>
                <p className="text-xs text-[#687788] mt-0.5">
                  Riders can be attached at policy inception to customize risk coverage.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {product.ridersAvailable.map((rider, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg border border-[#E2E8EF] bg-[#F7F9FB] text-xs font-medium text-[#182536] flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#16856D] flex-shrink-0" />
                  <span>{rider}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Policy Exclusions (Mandatory Compliance Scrutiny) */}
          <div className="bg-white rounded-xl border border-[#E2E8EF] p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#C44545]">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <h2 className="text-base font-bold font-['Manrope'] text-[#142D4E]">
                Crucial Policy Exclusions & Moratorium Clauses
              </h2>
            </div>
            <p className="text-xs text-[#687788]">
              As an authorised broker, FINCORE highlights exclusions upfront to protect policyholders against claim rejection.
            </p>
            <div className="space-y-2 pt-1">
              {product.exclusions.map((exclusion, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-[#FDF2F2] border border-[#C44545]/20 text-xs text-[#182536] flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C44545] mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{exclusion}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Specimen Documents & Broker Advisory */}
        <div className="lg:col-span-4 space-y-6">
          {/* Approved Specimen Documents */}
          <div className="bg-white rounded-xl border border-[#E2E8EF] p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#142D4E] font-['Manrope']">
              Important Specimen Documents
            </h3>
            <p className="text-xs text-[#687788]">
              Read verified wording brochures before requesting a quotation.
            </p>

            <div className="space-y-2.5">
              {product.specimenDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-lg border border-[#E2E8EF] bg-[#F7F9FB] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <FileText className="w-4 h-4 text-[#16856D] flex-shrink-0" />
                    <div className="truncate">
                      <span className="font-semibold text-[#182536] block truncate">
                        {doc.title}
                      </span>
                      <span className="text-[10px] text-[#687788]">
                        {doc.format} &bull; {doc.fileSize}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveDocModal(doc)}
                    className="p-1.5 rounded hover:bg-white text-[#142D4E] hover:text-[#16856D] transition-colors"
                    title="View Document"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Need Assistance Card */}
          <div className="bg-[#142D4E] text-white rounded-xl p-6 space-y-3">
            <h3 className="text-sm font-bold font-['Manrope']">
              Questions regarding this policy?
            </h3>
            <p className="text-xs text-white/80 leading-relaxed">
              Our licensed broker advisors will review your existing coverage and contrast this plan with alternatives from ICICI Pru, HDFC Life, and LIC.
            </p>
            <button
              onClick={() => {
                setModalType('QUESTION')
                setModalOpen(true)
              }}
              className="w-full py-2.5 text-xs font-semibold bg-[#16856D] hover:bg-[#0F6B57] text-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Consult an Advisor</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Document Preview Modal */}
      {activeDocModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8EF] max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8EF]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#16856D]" />
                <h4 className="font-bold text-[#142D4E] text-sm font-['Manrope']">
                  {activeDocModal.title}
                </h4>
              </div>
              <button
                onClick={() => setActiveDocModal(null)}
                className="p-1 text-[#687788] hover:text-[#142D4E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#F7F9FB] border border-[#E2E8EF] space-y-3 text-xs">
              <div className="flex justify-between text-[#687788]">
                <span>Document Format:</span>
                <span className="font-semibold text-[#182536]">{activeDocModal.format}</span>
              </div>
              <div className="flex justify-between text-[#687788]">
                <span>File Size:</span>
                <span className="font-semibold text-[#182536]">{activeDocModal.fileSize}</span>
              </div>
              <div className="flex justify-between text-[#687788]">
                <span>Insurer Reference:</span>
                <span className="font-semibold text-[#182536]">{product.uinNumber}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#FFF8EE] border border-[#C58A36]/30 text-[#C58A36]">
                <p className="text-[11px] leading-relaxed">
                  <strong>Notice:</strong> This is an authorized specimen policy wording for inspection and compliance reference. Actual binding schedules are generated upon insurer underwriting approval.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveDocModal(null)}
                className="px-4 py-2 rounded-lg border border-[#E2E8EF] text-xs font-semibold text-[#142D4E] hover:bg-[#F7F9FB]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Specimen document "${activeDocModal.title}" download simulated in demo mode.`)
                  setActiveDocModal(null)
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#16856D] hover:bg-[#0F6B57] text-white text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Specimen (Demo)</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Enquiry & Consultation Modal */}
      <EnquiryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        enquiryType={modalType}
        productName={product.name}
        insurerName={product.insurer}
        productId={product.id}
        desiredSumAssured={10000000}
      />
    </div>
  )
}
