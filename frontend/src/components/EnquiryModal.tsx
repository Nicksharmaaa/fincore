import React, { useState } from 'react'
import {
  X,
  ShieldCheck,
  Send,
  PhoneCall,
  FileSpreadsheet,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Copy,
  Clock,
  UserCheck,
} from 'lucide-react'
import { submitCustomerEnquiryAPI, type CustomerEnquiryResult } from '../services/api'

export type EnquiryType = 'QUOTE_REQUEST' | 'CALLBACK_REQUEST' | 'SAVE_COMPARISON' | 'QUESTION' | 'ASSESSMENT_SUBMISSION'

export interface EnquiryModalProps {
  isOpen: boolean
  onClose: () => void
  enquiryType: EnquiryType
  productName?: string
  insurerName?: string
  productId?: string
  productIds?: string[]
  desiredSumAssured?: number
  assessmentData?: Record<string, any>
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  onClose,
  enquiryType,
  productName,
  insurerName,
  productId,
  productIds,
  desiredSumAssured,
  assessmentData,
}) => {
  // Form State
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('Mumbai')
  const [timeSlot, setTimeSlot] = useState('Morning (09:00 AM – 12:00 PM)')
  const [message, setMessage] = useState('')
  const [consentGiven, setConsentGiven] = useState(true)

  // Request State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<CustomerEnquiryResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const getTitle = () => {
    switch (enquiryType) {
      case 'QUOTE_REQUEST':
        return 'Request Official Policy Quotation'
      case 'CALLBACK_REQUEST':
        return 'Request Priority Advisor Callback'
      case 'SAVE_COMPARISON':
        return 'Save & Email Comparison Dossier'
      case 'QUESTION':
        return 'Ask an Insurance Underwriting Specialist'
      case 'ASSESSMENT_SUBMISSION':
        return 'Submit Needs Assessment for Broker Review'
      default:
        return 'Insurance Enquiry'
    }
  }

  const getIcon = () => {
    switch (enquiryType) {
      case 'CALLBACK_REQUEST':
        return <PhoneCall className="w-5 h-5 text-[#16856D]" />
      case 'SAVE_COMPARISON':
        return <FileSpreadsheet className="w-5 h-5 text-[#16856D]" />
      case 'QUESTION':
        return <HelpCircle className="w-5 h-5 text-[#16856D]" />
      default:
        return <ShieldCheck className="w-5 h-5 text-[#16856D]" />
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Please complete all required fields.')
      return
    }
    if (!consentGiven) {
      setErrorMsg('Statutory DPDP consent is required to process your request.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const formattedMessage = [
        message.trim() ? `Note: ${message.trim()}` : '',
        timeSlot ? `Preferred Callback Time: ${timeSlot}` : '',
      ]
        .filter(Boolean)
        .join(' | ')

      const res = await submitCustomerEnquiryAPI({
        customer_name: fullName.trim(),
        customer_email: email.trim(),
        customer_phone: phone.trim(),
        city: city.trim(),
        enquiry_type: enquiryType,
        product_id: productId,
        product_ids: productIds,
        product_interest: productName ? `${productName} (${insurerName || 'Broker Partner'})` : 'Life Insurance Advisory',
        desired_sum_assured: desiredSumAssured || 10000000,
        message: formattedMessage,
        consent_given: consentGiven,
        lead_source: `WEBSITE_${enquiryType}`,
        assessment_data: assessmentData,
      })

      setResult(res)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit enquiry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyRef = () => {
    if (result?.lead_number) {
      navigator.clipboard.writeText(result.lead_number)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-[#E2E8EF] shadow-2xl overflow-hidden transition-all">
        {/* Header */}
        <div className="bg-[#142D4E] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              {getIcon()}
            </div>
            <div>
              <h3 className="font-bold text-base font-['Manrope']">{getTitle()}</h3>
              <p className="text-xs text-white/70">
                {productName ? `${productName} • ${insurerName || 'Partner Carrier'}` : 'FINCORE Authorised Direct Broker Desk'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {result ? (
            /* Confirmation Success State */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#E8F5F2] text-[#16856D] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-bold text-[#142D4E] font-['Manrope']">
                  Enquiry Successfully Registered
                </h4>
                <p className="text-xs text-[#687788] max-w-md mx-auto">
                  Your request has been routed to our licensed advisory team. A certified life insurance specialist is preparing your official proposal dossier.
                </p>
              </div>

              {/* Reference Badge */}
              <div className="p-4 rounded-xl bg-[#F7F9FB] border border-[#E2E8EF] max-w-sm mx-auto flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-[#687788] tracking-wider block">
                    Lead Docket Number
                  </span>
                  <span className="text-lg font-mono font-extrabold text-[#142D4E]">
                    {result.lead_number}
                  </span>
                </div>
                <button
                  onClick={handleCopyRef}
                  className="px-3 py-1.5 rounded-lg border border-[#E2E8EF] bg-white text-xs font-semibold text-[#142D4E] hover:bg-[#E9F1F5] flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Assigned Advisor Info */}
              <div className="p-4 rounded-xl bg-[#E8F5F2] border border-[#16856D]/30 max-w-sm mx-auto text-left flex items-start gap-3">
                <UserCheck className="w-5 h-5 text-[#16856D] mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-[#142D4E] block">Assigned Insurance Specialist:</span>
                  <span className="text-[#16856D] font-semibold">{result.assigned_advisor.name}</span>
                  <span className="text-[#687788] block text-[11px]">{result.assigned_advisor.email}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-[#687788]">
                <Clock className="w-4 h-4 text-[#16856D]" />
                <span>Expected Advisory Callback: <strong>Within 2 Business Hours</strong></span>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white text-xs font-semibold transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Inbound Enquiry Form */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-[#FDF2F2] border border-[#C44545]/20 text-[#C44545] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Product Context Banner */}
              {productName && (
                <div className="p-3 rounded-lg bg-[#F7F9FB] border border-[#E2E8EF] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#687788] tracking-wider block">
                      Target Policy
                    </span>
                    <span className="font-bold text-[#142D4E] text-sm">{productName}</span>
                    <span className="text-[#687788] block text-[11px]">{insurerName}</span>
                  </div>
                  {desiredSumAssured && (
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-[#687788] tracking-wider block">
                        Target Sum Assured
                      </span>
                      <span className="font-extrabold text-[#16856D] text-sm">
                        ₹{(desiredSumAssured / 10000000).toFixed(1)} Crore
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Contact Information Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#182536] block mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Vikram Sethi"
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8EF] focus:border-[#16856D] outline-hidden text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#182536] block mb-1">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91-98200-XXXXX"
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8EF] focus:border-[#16856D] outline-hidden text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#182536] block mb-1">
                    Official Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vikram@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8EF] focus:border-[#16856D] outline-hidden text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#182536] block mb-1">
                    City of Residence
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai, Bengaluru"
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8EF] focus:border-[#16856D] outline-hidden text-xs"
                  />
                </div>
              </div>

              {/* Preferred Callback Slot */}
              <div>
                <label className="font-semibold text-[#182536] block mb-1">
                  Preferred Consultation Slot
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8EF] focus:border-[#16856D] outline-hidden text-xs bg-white"
                >
                  <option value="Morning (09:00 AM – 12:00 PM)">Morning (09:00 AM – 12:00 PM)</option>
                  <option value="Afternoon (12:00 PM – 04:00 PM)">Afternoon (12:00 PM – 04:00 PM)</option>
                  <option value="Evening (04:00 PM – 08:00 PM)">Evening (04:00 PM – 08:00 PM)</option>
                  <option value="Weekend Priority">Weekend Priority Consultation</option>
                </select>
              </div>

              {/* Specific Query / Note */}
              <div>
                <label className="font-semibold text-[#182536] block mb-1">
                  Specific Questions or Underwriting Considerations (Optional)
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Inquire about smoking declarations, critical illness rider terms, or home loan collateral..."
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8EF] focus:border-[#16856D] outline-hidden text-xs resize-none"
                />
              </div>

              {/* Statutory DPDP Consent */}
              <div className="p-3 rounded-xl bg-[#E8F5F2] border border-[#16856D]/20 text-[11px] leading-relaxed">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5 accent-[#16856D]"
                  />
                  <span className="text-[#182536]">
                    <strong>Statutory DPDP Act & IRDAI Broker Consent:</strong> I authorize FINCORE (Authorised Direct Insurance Broker) to evaluate my life protection requirements, fetch quotes from partner carriers, and contact me via phone/WhatsApp in accordance with our Privacy Policy. Zero cold calls or spam policy.
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#E2E8EF] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-[#E2E8EF] text-[#687788] hover:text-[#182536] font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#16856D] hover:bg-[#0F6B57] text-white font-semibold text-xs shadow-xs transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting to Advisory Desk...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Inbound Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
