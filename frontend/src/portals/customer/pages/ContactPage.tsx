import React, { useState } from 'react'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Building,
  AlertCircle,
  HelpCircle,
  PhoneCall,
  Send,
  UserCheck,
} from 'lucide-react'
import { submitCustomerEnquiryAPI, type CustomerEnquiryResult } from '../../../services/api'

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionReceipt, setSubmissionReceipt] = useState<CustomerEnquiryResult | null>(null)

  const [quickCallbackSubmitted, setQuickCallbackSubmitted] = useState(false)
  const [quickPhone, setQuickPhone] = useState('')
  const [quickName, setQuickName] = useState('')
  const [quickLoading, setQuickLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    purpose: 'term-quote',
    message: '',
    consent: true,
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.name.trim()) errors.name = 'Full name is required'
    if (!formData.phone.trim() || formData.phone.length < 10) {
      errors.phone = 'Valid 10-digit mobile number is required'
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errors.email = 'Valid email address is required'
    }
    if (!formData.consent) {
      errors.consent = 'Statutory consent under DPDP Act is required'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const res = await submitCustomerEnquiryAPI({
        customer_name: formData.name.trim(),
        customer_email: formData.email.trim(),
        customer_phone: formData.phone.trim(),
        enquiry_type: 'QUESTION',
        product_interest: `Inquiry: ${formData.purpose}`,
        desired_sum_assured: 10000000,
        message: formData.message,
        consent_given: formData.consent,
        lead_source: 'WEBSITE_CONTACT_FORM',
      })
      setSubmissionReceipt(res)
      setSubmitted(true)
    } catch (err) {
      console.error('Contact form submission failed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickCallback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (quickPhone.trim().length < 10) return

    setQuickLoading(true)
    try {
      await submitCustomerEnquiryAPI({
        customer_name: quickName.trim() || 'Priority Callback Customer',
        customer_email: `${quickPhone.trim()}@fincore.callback`,
        customer_phone: quickPhone.trim(),
        enquiry_type: 'CALLBACK_REQUEST',
        product_interest: 'General Insurance Consultation',
        desired_sum_assured: 10000000,
        message: 'Priority 15-minute callback requested from website header banner.',
        consent_given: true,
        lead_source: 'WEBSITE_QUICK_CALLBACK_BANNER',
      })
      setQuickCallbackSubmitted(true)
    } catch (err) {
      console.error('Quick callback failed:', err)
    } finally {
      setQuickLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* 1. Page Header */}
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#16856D]">
          Customer Support & Advisory Bureau
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#142D4E] font-['Manrope'] tracking-tight">
          Contact FINCORE Advisory & Support
        </h1>
        <p className="text-base sm:text-lg text-[#687788] leading-relaxed">
          Whether you need an unbiased comparison across insurers, assistance with medical scheduling, clarification on a policy exclusion, or guidance on an active death claim.
        </p>
      </div>

      {/* 2. Quick Callback Banner */}
      <div className="bg-[#142D4E] text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs text-[#16856D] font-bold uppercase tracking-wider">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Priority Broker Assistance</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-['Manrope']">
            Need immediate advice on life coverage?
          </h2>
          <p className="text-xs text-white/80 max-w-lg">
            Request an immediate callback from a certified FINCORE insurance advisor within 15 minutes during market hours.
          </p>
        </div>

        {quickCallbackSubmitted ? (
          <div className="p-3.5 rounded-xl bg-white/10 border border-white/20 text-center text-xs space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-[#16856D] font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Callback Queued!</span>
            </div>
            <p className="text-white/80">An advisor will ring you at {quickPhone}.</p>
          </div>
        ) : (
          <form onSubmit={handleQuickCallback} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="tel"
              required
              value={quickPhone}
              onChange={(e) => setQuickPhone(e.target.value)}
              placeholder="Enter 10-digit mobile"
              className="h-10 px-3.5 rounded-lg text-xs bg-white text-[#182536] placeholder-[#687788] focus:outline-none focus:ring-2 focus:ring-[#16856D] w-full md:w-56"
            />
            <button
              type="submit"
              className="h-10 px-5 rounded-lg bg-[#16856D] hover:bg-[#0F6B57] text-white font-semibold text-xs whitespace-nowrap transition-colors"
            >
              Request Call
            </button>
          </form>
        )}
      </div>

      {/* 3. Main Contact Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Contact Consultation Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E2E8EF] p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-[#142D4E] font-['Manrope'] mb-2">
            Request an Advisory Consultation
          </h2>
          <p className="text-xs text-[#687788] mb-6 leading-relaxed">
            Our IRDAI-certified broker advisors provide unbiased guidance across all partner life insurers. We never share your phone number with aggressive telemarketers.
          </p>

          {submitted ? (
            <div className="p-8 rounded-xl bg-[#E8F5F2] border border-[#16856D]/30 space-y-4 text-center">
              <CheckCircle2 className="w-12 h-12 text-[#16856D] mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#142D4E] font-['Manrope']">
                  Consultation Request Registered
                </h3>
                <p className="text-xs text-[#182536] max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{formData.name}</strong>. Your enquiry has been securely logged in our broker management system.
                </p>
              </div>

              {submissionReceipt && (
                <div className="p-4 rounded-xl bg-white border border-[#E2E8EF] max-w-xs mx-auto text-left space-y-2">
                  <div>
                    <span className="text-[10px] text-[#687788] uppercase font-bold block">Lead Docket ID</span>
                    <span className="font-mono font-extrabold text-[#142D4E] text-base">{submissionReceipt.lead_number}</span>
                  </div>
                  <div className="pt-1 border-t border-[#E2E8EF] text-xs">
                    <span className="text-[#687788] block text-[11px]">Assigned Specialist:</span>
                    <span className="font-semibold text-[#16856D] block">{submissionReceipt.assigned_advisor.name}</span>
                  </div>
                </div>
              )}

              <p className="text-xs text-[#687788]">
                We will contact you at <strong>{formData.phone}</strong> within 2 business hours.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setSubmitted(false)
                    setFormData({
                      name: '',
                      phone: '',
                      email: '',
                      purpose: 'term-quote',
                      message: '',
                      consent: true,
                    })
                  }}
                  className="px-4 py-2 rounded-lg bg-white border border-[#E2E8EF] text-xs font-semibold text-[#142D4E] hover:bg-[#F7F9FB]"
                >
                  Send another inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#182536] mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Priya Sharma"
                    className={`w-full h-9 px-3 rounded-lg border bg-white text-[#182536] focus:outline-none transition-all ${
                      formErrors.name
                        ? 'border-[#C44545] focus:border-[#C44545]'
                        : 'border-[#E2E8EF] focus:border-[#142D4E]'
                    }`}
                  />
                  {formErrors.name && (
                    <span className="text-[10px] text-[#C44545] mt-1 block">{formErrors.name}</span>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-[#182536] mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                    className={`w-full h-9 px-3 rounded-lg border bg-white text-[#182536] focus:outline-none transition-all ${
                      formErrors.phone
                        ? 'border-[#C44545] focus:border-[#C44545]'
                        : 'border-[#E2E8EF] focus:border-[#142D4E]'
                    }`}
                  />
                  {formErrors.phone && (
                    <span className="text-[10px] text-[#C44545] mt-1 block">{formErrors.phone}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#182536] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="priya@example.com"
                    className={`w-full h-9 px-3 rounded-lg border bg-white text-[#182536] focus:outline-none transition-all ${
                      formErrors.email
                        ? 'border-[#C44545] focus:border-[#C44545]'
                        : 'border-[#E2E8EF] focus:border-[#142D4E]'
                    }`}
                  />
                  {formErrors.email && (
                    <span className="text-[10px] text-[#C44545] mt-1 block">{formErrors.email}</span>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-[#182536] mb-1">
                    Inquiry Category
                  </label>
                  <select
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-[#E2E8EF] bg-white text-[#182536] font-medium focus:outline-none focus:border-[#142D4E]"
                  >
                    <option value="term-quote">New Term Insurance Quote</option>
                    <option value="needs-assessment">Review My Needs Assessment</option>
                    <option value="policy-comparison">Compare Wording & Exclusions</option>
                    <option value="whole-life">Whole Life & Estate Planning</option>
                    <option value="annuity">Retirement Annuity Consultation</option>
                    <option value="claims-support">Claims Settlement Guidance</option>
                    <option value="grievance">Grievance Escalation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#182536] mb-1">
                  Message or Specific Question
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your target sum assured, smoking history, or specific policy wording questions..."
                  className="w-full p-3 rounded-lg border border-[#E2E8EF] bg-white text-[#182536] focus:outline-none focus:border-[#142D4E] resize-none"
                />
              </div>

              {/* Consent checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consent}
                    onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                    className="mt-0.5 rounded border-[#E2E8EF] text-[#16856D] focus:ring-[#16856D]"
                  />
                  <span className="text-[11px] text-[#687788] leading-tight">
                    I authorize FINCORE Insurance Broking Services Pvt. Ltd. to contact me regarding life insurance policy options in accordance with our Privacy Policy and the DPDP Act.
                  </span>
                </label>
                {formErrors.consent && (
                  <span className="text-[10px] text-[#C44545] mt-1 block">{formErrors.consent}</span>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white text-xs font-semibold transition-colors shadow-2xs flex items-center justify-center gap-1.5 active:scale-[0.99]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Consultation Request</span>
              </button>

              <p className="text-[11px] text-center text-[#687788]">
                We strictly respect your privacy. No unsolicited promotional spam.
              </p>
            </form>
          )}
        </div>

        {/* Right Column: Office coordinates, Direct Lines, Grievance Escalation */}
        <div className="lg:col-span-5 space-y-6">
          {/* Direct Contact Lines */}
          <div className="bg-white rounded-2xl border border-[#E2E8EF] p-6 space-y-4 shadow-sm text-xs">
            <h3 className="text-sm font-bold text-[#142D4E] font-['Manrope']">
              Direct Advisory Bureau Lines
            </h3>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#16856D] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#182536] block">Toll-Free Consumer Advisory</span>
                  <span className="text-[#687788]">1800-419-8800 (Mon–Sat, 9:00 AM – 7:00 PM IST)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#16856D] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#182536] block">Direct Board Line</span>
                  <span className="text-[#687788]">+91-22-6100-8000</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#16856D] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#182536] block">Electronic Inquiries</span>
                  <span className="text-[#687788] block">contact@fincore.in (General Advisory)</span>
                  <span className="text-[#687788] block">claims@fincore.in (Claims Assistance)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building className="w-4 h-4 text-[#16856D] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#182536] block">Principal Corporate Office</span>
                  <span className="text-[#687788] leading-relaxed block">
                    Level 14, Platina Tower<br />
                    Bandra Kurla Complex (BKC)<br />
                    Mumbai 400051, Maharashtra, India
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Grievance Redressal Card (IRDAI Mandatory) */}
          <div className="bg-[#F7F9FB] rounded-2xl border border-[#E2E8EF] p-6 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-[#142D4E]">
              <ShieldCheck className="w-4 h-4 text-[#16856D]" />
              <h3 className="font-bold font-['Manrope']">
                IRDAI Grievance Redressal Mechanism
              </h3>
            </div>
            <p className="text-[#687788] leading-relaxed">
              In accordance with IRDAI Protection of Policyholders' Interests Regulations, every policyholder has the right to fair grievance escalation. If your query is unresolved within 14 days, you may approach our Principal Grievance Officer:
            </p>

            <div className="pt-2 border-t border-[#E2E8EF] space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#687788]">Principal Grievance Officer:</span>
                <span className="font-semibold text-[#182536]">Mr. Suresh Nair</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#687788]">Grievance Direct Email:</span>
                <span className="font-semibold text-[#182536]">grievance@fincore.in</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#687788]">IRDAI Bima Bharosa:</span>
                <a
                  href="https://bimabharosa.irdai.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#16856D] font-semibold hover:underline inline-flex items-center gap-0.5"
                >
                  <span>bimabharosa.irdai.gov.in</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
