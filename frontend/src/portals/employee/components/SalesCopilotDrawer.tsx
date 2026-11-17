import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  X,
  Copy,
  Check,
  Send,
  BookOpen,
  HelpCircle,
  FileText,
  PhoneCall,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Scale,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { callCopilotAPI, type CopilotResult } from '../../../services/api'

interface SalesCopilotDrawerProps {
  isOpen: boolean
  onClose: () => void
  leadId?: string
  customerId?: string
  initialAction?: 'CUSTOMER_SUMMARY' | 'PRODUCT_SUGGESTION' | 'POLICY_WORDING' | 'DRAFT_MESSAGE' | 'CALL_PREPARATION' | 'QUOTE_COMPARISON' | 'TASK_SUMMARY'
}

export const SalesCopilotDrawer: React.FC<SalesCopilotDrawerProps> = ({
  isOpen,
  onClose,
  leadId,
  customerId,
  initialAction = 'CUSTOMER_SUMMARY',
}) => {
  const [activeTab, setActiveTab] = useState<'CUSTOMER_SUMMARY' | 'PRODUCT_SUGGESTION' | 'POLICY_WORDING' | 'DRAFT_MESSAGE' | 'CALL_PREPARATION' | 'QUOTE_COMPARISON' | 'TASK_SUMMARY'>(initialAction)
  const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp')
  const [wordingTopic, setWordingTopic] = useState<'section_45' | 'suicide_clause' | 'mwp_act' | 'free_look_period' | 'grace_period'>('section_45')
  const [loading, setLoading] = useState(false)
  const [copilotData, setCopilotData] = useState<CopilotResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [employeeConfirmed, setEmployeeConfirmed] = useState(false)

  useEffect(() => {
    if (initialAction) {
      setActiveTab(initialAction)
    }
  }, [initialAction])

  useEffect(() => {
    if (isOpen) {
      loadCopilotContent(activeTab)
    }
  }, [isOpen, activeTab, leadId, customerId, channel, wordingTopic])

  const loadCopilotContent = async (tab: typeof activeTab) => {
    setLoading(true)
    try {
      const res = await callCopilotAPI(tab, {
        leadId,
        customerId,
        query: tab === 'POLICY_WORDING' ? wordingTopic : undefined,
        context: { channel },
      })
      setCopilotData(res)
    } catch (err) {
      console.error('Failed to query copilot', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyDraft = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div
        className="relative w-full max-w-xl bg-white shadow-2xl h-full flex flex-col z-10 border-l border-[#E2E8EF]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Header */}
        <div className="h-16 px-6 bg-[#142D4E] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#16856D] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold font-['Manrope'] tracking-wide">
                  FINCORE Sales Copilot
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-white/10 px-1.5 py-0.5 rounded text-[#E9F1F5]">
                  AI Advisory
                </span>
              </div>
              <p className="text-[11px] text-white/70">
                Institutional underwriting assistance & policy intelligence
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close Copilot"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Tabs Bar */}
        <div className="flex items-center bg-[#F7F9FB] border-b border-[#E2E8EF] px-3 overflow-x-auto scrollbar-none text-xs flex-shrink-0">
          <button
            onClick={() => setActiveTab('CUSTOMER_SUMMARY')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'CUSTOMER_SUMMARY'
                ? 'border-[#16856D] text-[#142D4E]'
                : 'border-transparent text-[#687788] hover:text-[#182536]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Client Brief</span>
          </button>

          <button
            onClick={() => setActiveTab('PRODUCT_SUGGESTION')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'PRODUCT_SUGGESTION'
                ? 'border-[#16856D] text-[#142D4E]'
                : 'border-transparent text-[#687788] hover:text-[#182536]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Product Match</span>
          </button>

          <button
            onClick={() => setActiveTab('POLICY_WORDING')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'POLICY_WORDING'
                ? 'border-[#16856D] text-[#142D4E]'
                : 'border-transparent text-[#687788] hover:text-[#182536]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Clauses & Law</span>
          </button>

          <button
            onClick={() => setActiveTab('DRAFT_MESSAGE')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'DRAFT_MESSAGE'
                ? 'border-[#16856D] text-[#142D4E]'
                : 'border-transparent text-[#687788] hover:text-[#182536]'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Draft Message</span>
          </button>

          <button
            onClick={() => setActiveTab('CALL_PREPARATION')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'CALL_PREPARATION'
                ? 'border-[#16856D] text-[#142D4E]'
                : 'border-transparent text-[#687788] hover:text-[#182536]'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call Prep</span>
          </button>

          <button
            onClick={() => setActiveTab('QUOTE_COMPARISON')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'QUOTE_COMPARISON'
                ? 'border-[#16856D] text-[#142D4E]'
                : 'border-transparent text-[#687788] hover:text-[#182536]'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Quotes Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('TASK_SUMMARY')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'TASK_SUMMARY'
                ? 'border-[#16856D] text-[#142D4E]'
                : 'border-transparent text-[#687788] hover:text-[#182536]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Daily Tasks</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-[#16856D] animate-spin" />
              <p className="text-xs text-[#687788]">
                Synthesizing customer profile & regulatory underwriting guidelines...
              </p>
            </div>
          ) : copilotData ? (
            <>
              {/* Secondary Sub-filters for Drafts & Policy Wordings */}
              {activeTab === 'DRAFT_MESSAGE' && (
                <div className="flex items-center gap-2 pb-2">
                  <span className="text-xs text-[#687788] font-medium">Channel:</span>
                  <div className="inline-flex rounded-lg border border-[#E2E8EF] p-0.5 bg-[#F7F9FB] text-xs">
                    <button
                      onClick={() => setChannel('whatsapp')}
                      className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                        channel === 'whatsapp'
                          ? 'bg-[#16856D] text-white shadow-xs'
                          : 'text-[#687788] hover:text-[#182536]'
                      }`}
                    >
                      WhatsApp Message
                    </button>
                    <button
                      onClick={() => setChannel('email')}
                      className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                        channel === 'email'
                          ? 'bg-[#142D4E] text-white shadow-xs'
                          : 'text-[#687788] hover:text-[#182536]'
                      }`}
                    >
                      Formal Email
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'POLICY_WORDING' && (
                <div className="space-y-1.5">
                  <span className="text-xs text-[#687788] font-medium">Select Key Policy Clause:</span>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {[
                      { key: 'section_45', label: 'Section 45 (Incontestability)' },
                      { key: 'suicide_clause', label: 'Suicide (12 Months)' },
                      { key: 'mwp_act', label: 'MWP Act Protection' },
                      { key: 'free_look_period', label: '30-Day Free Look' },
                      { key: 'grace_period', label: 'Grace Period' },
                    ].map((c) => (
                      <button
                        key={c.key}
                        onClick={() => setWordingTopic(c.key as any)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                          wordingTopic === c.key
                            ? 'bg-[#142D4E] text-white border-[#142D4E]'
                            : 'bg-white text-[#182536] border-[#E2E8EF] hover:bg-[#F7F9FB]'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Title & Core Overview */}
              <div className="bg-[#F7F9FB] p-4 rounded-xl border border-[#E2E8EF] space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#142D4E] font-['Manrope']">
                    {copilotData.title}
                  </h3>
                  <span className="text-[10px] font-bold text-[#16856D] bg-[#E8F5F2] px-2 py-0.5 rounded">
                    Verified Advisory
                  </span>
                </div>
                <div className="text-xs text-[#182536] leading-relaxed whitespace-pre-line">
                  {copilotData.summary_markdown}
                </div>
              </div>

              {/* Product Matches (if PRODUCT_SUGGESTION) */}
              {activeTab === 'PRODUCT_SUGGESTION' && copilotData.suggested_products && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#142D4E] uppercase tracking-wider">
                    Recommended Insurer Solutions
                  </h4>
                  <div className="space-y-2.5">
                    {copilotData.suggested_products.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-[#E2E8EF] bg-white hover:border-[#16856D] transition-colors space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-bold text-[#182536] block">
                              {p.product_name}
                            </span>
                            <span className="text-[10px] text-[#16856D] font-semibold">
                              {p.insurer} &bull; UIN: {p.uin}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-[#16856D] bg-[#E8F5F2] px-2 py-0.5 rounded">
                            {p.suitability_score}% Match
                          </span>
                        </div>
                        <p className="text-[11px] text-[#687788] leading-normal">{p.fit_reason}</p>
                        <div className="flex items-center justify-between pt-1 border-t border-[#E2E8EF] text-xs">
                          <span className="text-[11px] text-[#687788]">
                            Indicative monthly: <strong>₹{p.indicative_monthly.toLocaleString('en-IN')}</strong>
                          </span>
                          <span className="text-[11px] font-semibold text-[#142D4E] hover:underline cursor-pointer">
                            Configure Quote &rarr;
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ready to Send Draft Box (if DRAFT_MESSAGE) */}
              {activeTab === 'DRAFT_MESSAGE' && copilotData.ready_to_send_draft && (
                <div className="space-y-3">
                  {/* Mandatory Employee Confirmation Safeguard */}
                  <div className="p-3 bg-[#FDF7EE] border border-[#C58A36]/30 rounded-xl space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#C58A36] flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-[#182536] block">
                          Mandatory Human Safeguard: Employee Confirmation Required
                        </span>
                        <p className="text-[11px] text-[#687788]">
                          Under IRDAI solicitation guidelines, all AI-generated drafts must be explicitly verified by a licensed employee prior to client transmission.
                        </p>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 pt-1 text-xs font-semibold text-[#142D4E] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={employeeConfirmed}
                        onChange={(e) => setEmployeeConfirmed(e.target.checked)}
                        className="w-4 h-4 text-[#16856D] rounded border-[#E2E8EF]"
                      />
                      <span>I have verified this draft and confirm accuracy of quoted figures</span>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#142D4E] uppercase tracking-wider">
                      Generated Message Copy
                    </span>
                    <button
                      onClick={() => {
                        if (!employeeConfirmed) {
                          alert('Please check the confirmation box above to verify the draft before copying.')
                          return
                        }
                        handleCopyDraft(copilotData.ready_to_send_draft!)
                      }}
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                        employeeConfirmed
                          ? 'bg-[#142D4E] text-white hover:bg-[#1D3D5C]'
                          : 'bg-[#E9F1F5] text-[#687788] cursor-not-allowed'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Verified Draft</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[#E2E8EF] bg-[#F7F9FB] text-xs font-mono text-[#182536] leading-relaxed whitespace-pre-wrap">
                    {copilotData.ready_to_send_draft}
                  </div>
                </div>
              )}

              {/* Discovery Questions (if CALL_PREPARATION or CUSTOMER_SUMMARY) */}
              {copilotData.discovery_questions && copilotData.discovery_questions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#142D4E] uppercase tracking-wider">
                    Recommended Discovery Questions
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {copilotData.discovery_questions.map((q, i) => (
                      <li key={i} className="p-2.5 rounded-lg border border-[#E2E8EF] bg-white flex items-start gap-2.5">
                        <span className="w-4 h-4 rounded-full bg-[#E9F1F5] text-[#142D4E] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-[#182536] text-[11px] leading-relaxed">{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Advisor Key Points */}
              {copilotData.key_points && copilotData.key_points.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#142D4E] uppercase tracking-wider">
                    Underwriting & Sales Takeaways
                  </h4>
                  <div className="space-y-1.5 text-xs text-[#182536]">
                    {copilotData.key_points.map((pt, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16856D] mt-1.5 flex-shrink-0" />
                        <span className="text-[11px] text-[#687788] leading-normal">{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Statutory Notice */}
              {copilotData.regulatory_notes && (
                <div className="p-3 rounded-lg bg-[#E8F5F2] border border-[#16856D]/20 text-[11px] text-[#142D4E] flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#16856D] flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Broker Disclosure:</strong> {copilotData.regulatory_notes}
                  </p>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8EF] bg-[#F7F9FB] flex items-center justify-between text-xs text-[#687788] flex-shrink-0">
          <span>FINCORE Advisor Copilot v2.4</span>
          <button
            onClick={() => loadCopilotContent(activeTab)}
            className="inline-flex items-center gap-1 text-[#142D4E] font-semibold hover:underline"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Regenerate Advice</span>
          </button>
        </div>
      </div>
    </div>
  )
}
