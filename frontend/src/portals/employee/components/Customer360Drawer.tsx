import React, { useState, useEffect } from 'react'
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Briefcase,
  AlertCircle,
  X,
  ExternalLink,
  Sparkles,
  Download,
  Plus,
} from 'lucide-react'
import {
  fetchCustomer360API,
  type Customer360Data,
  type CRMCustomer,
} from '../../../services/api'
import { SalesCopilotDrawer } from './SalesCopilotDrawer'

interface Customer360DrawerProps {
  isOpen: boolean
  onClose: () => void
  customerId: string
  initialCustomer?: CRMCustomer
}

type TabType =
  | 'overview'
  | 'assessment'
  | 'interested_products'
  | 'quotations'
  | 'applications'
  | 'documents'
  | 'interactions'
  | 'tasks'

export const Customer360Drawer: React.FC<Customer360DrawerProps> = ({
  isOpen,
  onClose,
  customerId,
  initialCustomer,
}) => {
  const [data, setData] = useState<Customer360Data | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [copilotOpen, setCopilotOpen] = useState(false)

  useEffect(() => {
    if (isOpen && customerId) {
      load360Data()
    }
  }, [isOpen, customerId])

  const load360Data = async () => {
    setLoading(true)
    try {
      const res = await fetchCustomer360API(customerId)
      setData(res)
    } catch (err) {
      console.error('Customer 360 fetch error', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const cust = data?.customer || initialCustomer

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div
        className="relative w-full max-w-3xl bg-white shadow-2xl h-full flex flex-col z-10 border-l border-[#E2E8EF]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Header */}
        <div className="h-16 px-6 bg-[#142D4E] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1D3D5C] border border-white/20 flex items-center justify-center font-bold text-xs text-white">
              {cust?.full_name ? cust.full_name.slice(0, 2).toUpperCase() : 'CU'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-['Manrope']">
                  {cust?.full_name || 'Customer 360°'}
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-[#16856D] text-white px-2 py-0.2 rounded">
                  {cust?.segment || 'Client'}
                </span>
              </div>
              <p className="text-[11px] text-white/70">
                {cust?.email} &bull; {cust?.phone} &bull; {cust?.city}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCopilotOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16856D] hover:bg-[#126b57] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Summary</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 8-Tab Navigation Bar */}
        <div className="bg-[#F7F9FB] border-b border-[#E2E8EF] px-4 flex items-center gap-1 overflow-x-auto scrollbar-none text-xs font-semibold flex-shrink-0">
          {[
            { key: 'overview', label: '1. Overview' },
            { key: 'assessment', label: '2. Assessment' },
            { key: 'interested_products', label: '3. Interested Products' },
            { key: 'quotations', label: '4. Quotations' },
            { key: 'applications', label: `5. Applications (${data?.applications?.length || 0})` },
            { key: 'documents', label: `6. Documents (${data?.documents?.length || 0})` },
            { key: 'interactions', label: `7. History (${data?.interaction_history?.length || 0})` },
            { key: 'tasks', label: `8. Tasks (${data?.tasks?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'border-[#16856D] text-[#142D4E] font-bold'
                  : 'border-transparent text-[#687788] hover:text-[#182536]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-xs text-[#687788]">
              Loading comprehensive 360° policyholder repository...
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && cust && (
                <div className="space-y-6 text-xs">
                  {/* KPI Stat Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl border border-[#E2E8EF] bg-[#F7F9FB] space-y-1">
                      <span className="text-[10px] text-[#687788] block font-medium">KYC Status</span>
                      <span className="text-sm font-bold text-[#16856D] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{cust.kyc_status}</span>
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-[#E2E8EF] bg-[#F7F9FB] space-y-1">
                      <span className="text-[10px] text-[#687788] block font-medium">Policies Held</span>
                      <span className="text-sm font-bold text-[#142D4E]">
                        {cust.total_policies || 1} Active Policy
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-[#E2E8EF] bg-[#F7F9FB] space-y-1">
                      <span className="text-[10px] text-[#687788] block font-medium">Total In-Force Cover</span>
                      <span className="text-sm font-bold text-[#142D4E]">
                        {cust.total_sum_assured || '₹2.0 Crore'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-[#E2E8EF] bg-[#F7F9FB] space-y-1">
                      <span className="text-[10px] text-[#687788] block font-medium">Wealth Segment</span>
                      <span className="text-sm font-bold text-[#16856D]">
                        {cust.segment}
                      </span>
                    </div>
                  </div>

                  {/* Demographic & KYC Details */}
                  <div className="p-4 rounded-xl border border-[#E2E8EF] bg-white space-y-3">
                    <h3 className="text-sm font-bold text-[#142D4E] font-['Manrope'] pb-2 border-b border-[#E2E8EF]">
                      Verified Demographic & Identity Details
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-[#687788] block text-[10px]">Encrypted / Masked PAN</span>
                        <span className="font-mono font-bold text-[#142D4E] text-xs">
                          {cust.pan_number || 'ABCDE1234F'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#687788] block text-[10px]">Date of Birth</span>
                        <span className="font-semibold text-[#182536]">{cust.dob || '15-Jun-1992'}</span>
                      </div>
                      <div>
                        <span className="text-[#687788] block text-[10px]">Verified Phone</span>
                        <span className="font-semibold text-[#182536]">{cust.phone}</span>
                      </div>
                      <div>
                        <span className="text-[#687788] block text-[10px]">Email Address</span>
                        <span className="font-semibold text-[#182536]">{cust.email}</span>
                      </div>
                      <div>
                        <span className="text-[#687788] block text-[10px]">Primary City</span>
                        <span className="font-semibold text-[#182536]">{cust.city}</span>
                      </div>
                      <div>
                        <span className="text-[#687788] block text-[10px]">Annual Declared Income</span>
                        <span className="font-bold text-[#16856D]">
                          {cust.annual_income ? `₹${cust.annual_income.toLocaleString('en-IN')}` : '₹28,00,000'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Active Policy Holdings */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-[#142D4E] uppercase tracking-wider">
                      Partner Insurer Policy Holdings
                    </h3>
                    <div className="p-3.5 rounded-xl border border-[#E2E8EF] bg-[#F7F9FB] flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-[#182536] block">
                          Click 2 Protect Super (HDFC Life)
                        </span>
                        <span className="text-[11px] text-[#687788]">
                          Policy #POL-HDFC-99210 &bull; Sum Assured: ₹2.0 Crore &bull; Annual Premium: ₹22,400
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-[#16856D] bg-[#E8F5F2] px-2 py-0.5 rounded">
                        In-Force Active
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: NEEDS ASSESSMENT */}
              {activeTab === 'assessment' && (
                <div className="space-y-4 text-xs">
                  {data?.assessments && data.assessments.length > 0 ? (
                    data.assessments.map((ass) => (
                      <div key={ass.id} className="p-4 rounded-xl border border-[#E2E8EF] bg-white space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8EF]">
                          <div>
                            <span className="font-bold text-sm text-[#142D4E] font-['Manrope'] block">
                              Assessed Human Life Value (HLV) Dossier
                            </span>
                            <span className="text-[10px] text-[#687788]">Recorded: {ass.created_at}</span>
                          </div>
                          <span className="text-xs font-bold text-[#16856D] bg-[#E8F5F2] px-2.5 py-1 rounded">
                            Gap: ₹{(ass.coverage_gap / 10000000).toFixed(2)} Cr
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F7F9FB] p-3 rounded-lg border border-[#E2E8EF]">
                          <div>
                            <span className="text-[#687788] block text-[10px]">Income Replacement (12x)</span>
                            <span className="font-bold text-[#142D4E]">
                              ₹{((ass.annual_income * 12) / 10000000).toFixed(2)} Cr
                            </span>
                          </div>
                          <div>
                            <span className="text-[#687788] block text-[10px]">Debt / Liabilities</span>
                            <span className="font-bold text-[#C44545]">
                              ₹{(ass.outstanding_liabilities / 100000).toFixed(0)} Lakh
                            </span>
                          </div>
                          <div>
                            <span className="text-[#687788] block text-[10px]">Child Education Goal</span>
                            <span className="font-bold text-[#142D4E]">
                              ₹{(ass.education_fund_target / 100000).toFixed(0)} Lakh
                            </span>
                          </div>
                          <div>
                            <span className="text-[#687788] block text-[10px]">Declared Existing Cover</span>
                            <span className="font-bold text-[#16856D]">
                              ₹{(ass.existing_cover / 100000).toFixed(0)} Lakh
                            </span>
                          </div>
                        </div>

                        {ass.recommendation_notes && (
                          <div className="p-3 rounded-lg bg-[#E9F1F5] text-[11px] text-[#142D4E] leading-relaxed">
                            <strong>Broker Advisory Note:</strong> {ass.recommendation_notes}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#687788] text-center py-8">
                      No formal needs assessment recorded for this customer yet.
                    </p>
                  )}
                </div>
              )}

              {/* TAB 3: INTERESTED PRODUCTS */}
              {activeTab === 'interested_products' && (
                <div className="space-y-3 text-xs">
                  <h3 className="font-bold text-xs text-[#142D4E] uppercase tracking-wider">
                    Shortlisted & Researched Plans
                  </h3>
                  <div className="space-y-2">
                    <div className="p-3.5 rounded-xl border border-[#E2E8EF] bg-white flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-[#182536] block">
                          Click 2 Protect Super (HDFC Life)
                        </span>
                        <span className="text-[11px] text-[#687788]">
                          Category: Pure Risk Term Insurance &bull; Milestone sum assured top-up
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-[#16856D] bg-[#E8F5F2] px-2 py-0.5 rounded">
                        High Fit (96%)
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-[#E2E8EF] bg-white flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-[#182536] block">
                          iProtect Smart (ICICI Prudential)
                        </span>
                        <span className="text-[11px] text-[#687788]">
                          Category: Term with Critical Illness Rider &bull; 34 Critical illnesses covered
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-[#142D4E] bg-[#E9F1F5] px-2 py-0.5 rounded">
                        Comparison Dossier Sent
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: QUOTATIONS */}
              {activeTab === 'quotations' && (
                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-xl border border-[#E2E8EF] bg-white space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E2E8EF]">
                      <div>
                        <span className="font-mono font-bold text-xs text-[#142D4E]">QT-501</span>
                        <span className="text-[11px] text-[#687788] ml-2">Delivered to Client</span>
                      </div>
                      <span className="text-[10px] font-bold text-[#16856D] bg-[#E8F5F2] px-2 py-0.5 rounded">
                        Valid until 15-Dec-2026
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="p-2.5 rounded-lg border border-[#E2E8EF] bg-[#F7F9FB] flex items-center justify-between">
                        <div>
                          <span className="font-bold text-[#182536] block">Option A: HDFC Life C2P Super</span>
                          <span className="text-[10px] text-[#687788]">₹2.0 Cr Cover &bull; 35 Yr Term</span>
                        </div>
                        <span className="font-bold text-[#142D4E]">₹1,866 / mo (₹22,400 / yr)</span>
                      </div>

                      <div className="p-2.5 rounded-lg border border-[#E2E8EF] bg-[#F7F9FB] flex items-center justify-between">
                        <div>
                          <span className="font-bold text-[#182536] block">Option B: ICICI Pru iProtect Smart</span>
                          <span className="text-[10px] text-[#687788]">₹2.0 Cr Cover + Multi-Pay CI &bull; 35 Yr Term</span>
                        </div>
                        <span className="font-bold text-[#142D4E]">₹1,980 / mo (₹23,760 / yr)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: APPLICATIONS */}
              {activeTab === 'applications' && (
                <div className="space-y-3 text-xs">
                  {data?.applications && data.applications.length > 0 ? (
                    data.applications.map((app) => (
                      <div key={app.id} className="p-4 rounded-xl border border-[#E2E8EF] bg-white space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-mono font-bold text-xs text-[#142D4E] block">
                              {app.application_number}
                            </span>
                            <span className="text-xs font-semibold text-[#182536]">{app.insurer_name}</span>
                            <span className="text-[11px] text-[#687788] block">
                              Insurer Ref: {app.external_insurer_proposal_no || 'Pending Submission'}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-[#16856D] bg-[#E8F5F2] px-2 py-0.5 rounded">
                            {app.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-[11px] text-[#687788] pt-1">
                          <span>Sum Assured: <strong>₹{(app.sum_assured / 100000).toFixed(0)} Lakh</strong></span>
                          <span>Annual Premium: <strong>₹{app.annual_premium.toLocaleString('en-IN')}</strong></span>
                          {app.policy_number && <span>Policy #: <strong className="font-mono text-[#16856D]">{app.policy_number}</strong></span>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#687788] text-center py-8">No formal policy applications submitted yet.</p>
                  )}
                </div>
              )}

              {/* TAB 6: DOCUMENTS */}
              {activeTab === 'documents' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#142D4E] uppercase tracking-wider">
                      Verified KYC & Compliance Vault
                    </span>
                    <button className="text-[11px] font-bold text-[#16856D] hover:underline flex items-center gap-1">
                      <Plus className="w-3 h-3" />
                      <span>Upload Document</span>
                    </button>
                  </div>

                  {data?.documents && data.documents.length > 0 ? (
                    <div className="divide-y divide-[#E2E8EF] border border-[#E2E8EF] rounded-xl overflow-hidden bg-white">
                      {data.documents.map((doc) => (
                        <div key={doc.id} className="p-3.5 flex items-center justify-between hover:bg-[#F7F9FB]">
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-[#142D4E]" />
                            <div>
                              <span className="font-semibold text-[#182536] block">{doc.file_name}</span>
                              <span className="text-[10px] text-[#687788] font-mono">
                                {doc.doc_number} &bull; Type: {doc.doc_type}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[#16856D] bg-[#E8F5F2] px-2 py-0.5 rounded">
                              {doc.verification_status}
                            </span>
                            <button className="p-1 rounded text-[#687788] hover:text-[#142D4E]" title="Download">
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#687788] text-center py-8">No KYC files attached.</p>
                  )}
                </div>
              )}

              {/* TAB 7: INTERACTION HISTORY */}
              {activeTab === 'interactions' && (
                <div className="space-y-3 text-xs">
                  <h3 className="font-bold text-xs text-[#142D4E] uppercase tracking-wider">
                    Full Chronological Timeline
                  </h3>
                  {data?.interaction_history && data.interaction_history.length > 0 ? (
                    <div className="divide-y divide-[#E2E8EF] border border-[#E2E8EF] rounded-xl overflow-hidden bg-white">
                      {data.interaction_history.map((act) => (
                        <div key={act.id} className="p-3.5 space-y-1 hover:bg-[#F7F9FB]">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#182536] flex items-center gap-1.5">
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-[#E9F1F5] text-[#142D4E]">
                                {act.activity_type}
                              </span>
                              <span>{act.title}</span>
                            </span>
                            <span className="text-[10px] text-[#687788]">{act.occurred_at}</span>
                          </div>
                          {act.notes && (
                            <p className="text-[11px] text-[#687788] leading-relaxed">{act.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#687788] text-center py-8">No interactions recorded.</p>
                  )}
                </div>
              )}

              {/* TAB 8: TASKS */}
              {activeTab === 'tasks' && (
                <div className="space-y-3 text-xs">
                  <h3 className="font-bold text-xs text-[#142D4E] uppercase tracking-wider">
                    Follow-ups & Service Tasks
                  </h3>
                  {data?.tasks && data.tasks.length > 0 ? (
                    <div className="divide-y divide-[#E2E8EF] border border-[#E2E8EF] rounded-xl overflow-hidden bg-white">
                      {data.tasks.map((t) => (
                        <div key={t.id} className="p-3.5 flex items-center justify-between hover:bg-[#F7F9FB]">
                          <div className="space-y-0.5">
                            <span className="font-bold text-[#182536] block">{t.title}</span>
                            {t.description && (
                              <span className="text-[11px] text-[#687788] block">{t.description}</span>
                            )}
                            <span className="text-[10px] text-[#16856D] font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{t.due_date}</span>
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              t.status === 'Completed'
                                ? 'bg-[#E8F5F2] text-[#16856D]'
                                : 'bg-[#FDF2F2] text-[#C44545]'
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#687788] text-center py-8">No open tasks for this customer.</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8EF] bg-[#F7F9FB] flex items-center justify-between text-xs flex-shrink-0">
          <span className="text-[#687788]">Customer ID: {cust?.id || customerId}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#142D4E] text-white font-semibold hover:bg-[#1D3D5C]"
          >
            Close Profile
          </button>
        </div>
      </div>

      {/* Copilot Drawer */}
      <SalesCopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        customerId={cust?.id || customerId}
        initialAction="CUSTOMER_SUMMARY"
      />
    </div>
  )
}
