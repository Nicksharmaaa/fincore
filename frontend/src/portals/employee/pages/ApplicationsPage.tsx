import React, { useState, useEffect, useMemo } from 'react'
import {
  ClipboardList,
  Search,
  Filter,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building,
  RefreshCw,
  Lock,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Check,
  X,
  Sparkles,
} from 'lucide-react'
import {
  fetchApplicationsAPI,
  updateApplicationStatusAPI,
  type CRMApplication,
} from '../../../services/api'

const ALL_APPLICATION_STAGES = [
  'Enquiry',
  'Product selection',
  'Quote',
  'Proposal Drafted',
  'Submitted to Insurer',
  'Underwriting Review',
  'Additional Requirements Requested',
  'Accepted by Insurer',
  'Declined by Insurer',
  'Policy Issued',
]

const BROKER_CONTROLLED_STATES = [
  'Enquiry',
  'Product selection',
  'Quote',
  'Proposal Drafted',
  'KYC Submitted',
  'Additional Requirements Uploaded',
]

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<CRMApplication[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [insurerFilter, setInsurerFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals state
  const [inspectApp, setInspectApp] = useState<CRMApplication | null>(null)
  const [verifyModalApp, setVerifyModalApp] = useState<CRMApplication | null>(null)
  const [targetStatus, setTargetStatus] = useState<string>('Submitted to Insurer')
  const [verificationProposalNo, setVerificationProposalNo] = useState('')
  const [verificationPolicyNo, setVerificationPolicyNo] = useState('')
  const [verificationNotes, setVerificationNotes] = useState('')
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [syncToast, setSyncToast] = useState<string | null>(null)

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    setLoading(true)
    try {
      const data = await fetchApplicationsAPI()
      setApplications(data)
    } catch (err) {
      console.error('Failed to load applications', err)
    } finally {
      setLoading(false)
    }
  }

  // Filtered applications
  const filteredApps = useMemo(() => {
    let result = [...applications]
    if (statusFilter !== 'ALL') {
      result = result.filter((a) => a.status === statusFilter)
    }
    if (insurerFilter !== 'ALL') {
      result = result.filter((a) => a.insurer_name.toLowerCase().includes(insurerFilter.toLowerCase()))
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (a) =>
          a.application_number.toLowerCase().includes(q) ||
          a.client_name.toLowerCase().includes(q) ||
          (a.external_insurer_proposal_no && a.external_insurer_proposal_no.toLowerCase().includes(q)) ||
          (a.policy_number && a.policy_number.toLowerCase().includes(q))
      )
    }
    return result
  }, [applications, statusFilter, insurerFilter, searchQuery])

  // Insurer sync simulation
  const handleSyncInsurer = async (app: CRMApplication) => {
    setSyncingId(app.id)
    setTimeout(async () => {
      setSyncingId(null)
      setSyncToast(`Carrier Gateway Sync successful: Verified proposal ${app.external_insurer_proposal_no || 'HDFC-PROP-440192'}.`)
      setTimeout(() => setSyncToast(null), 3500)
    }, 1200)
  }

  // Broker-controlled transition (e.g. Proposal Drafted -> KYC Submitted)
  const handleBrokerTransition = async (appId: string, newSt: string) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newSt as any } : a))
    )
    await updateApplicationStatusAPI(appId, newSt)
  }

  // Open modal for Insurer-Controlled verification
  const handleOpenInsurerVerification = (app: CRMApplication, target: string) => {
    setVerifyModalApp(app)
    setTargetStatus(target)
    setVerificationProposalNo(app.external_insurer_proposal_no || `${app.insurer_name.slice(0, 4).toUpperCase()}-PROP-${Math.floor(10000 + Math.random() * 90000)}`)
    setVerificationPolicyNo(app.policy_number || (target === 'Policy Issued' ? `POL-${app.insurer_name.slice(0, 4).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}` : ''))
    setVerificationNotes(
      target === 'Policy Issued'
        ? 'Confirmed external carrier underwriting approval and first-year premium realization.'
        : `Verified underwriting stage update via carrier operations desk handshake.`
    )
  }

  // Submit verified transition
  const handleConfirmVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verifyModalApp) return

    const updated = {
      ...verifyModalApp,
      status: targetStatus as any,
      external_insurer_proposal_no: verificationProposalNo,
      policy_number: targetStatus === 'Policy Issued' ? verificationPolicyNo : verifyModalApp.policy_number,
      underwriting_notes: verificationNotes,
    }

    setApplications((prev) =>
      prev.map((a) => (a.id === verifyModalApp.id ? updated : a))
    )

    await updateApplicationStatusAPI(
      verifyModalApp.id,
      targetStatus,
      verificationNotes,
      verificationProposalNo,
      targetStatus === 'Policy Issued' ? verificationPolicyNo : undefined
    )

    setVerifyModalApp(null)
    setSyncToast(`Underwriting status transitioned to "${targetStatus}" with verified carrier audit log.`)
    setTimeout(() => setSyncToast(null), 3500)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Policy Issued':
        return 'bg-[#E8F5F2] text-[#16856D] font-bold'
      case 'Underwriting Review':
      case 'Insurer Underwriting Review':
        return 'bg-[#FDF7EE] text-[#C58A36] font-semibold'
      case 'Tele-Medical Scheduled':
        return 'bg-[#E9F1F5] text-[#142D4E] font-semibold'
      case 'Proposal Drafted':
        return 'bg-[#E9F1F5] text-[#1D3D5C]'
      case 'Declined by Insurer':
        return 'bg-[#FDF2F2] text-[#C44545] font-bold'
      default:
        return 'bg-[#F7F9FB] text-[#687788] border border-[#E2E8EF]'
    }
  }

  return (
    <div className="space-y-6 select-none" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8EF]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#16856D] bg-[#E8F5F2] px-2 py-0.5 rounded">
              Policy Lifecycle Operations
            </span>
            <span className="text-[11px] text-[#687788]">
              {applications.length} Multi-Insurer Proposal Applications
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#142D4E] font-['Manrope'] mt-1">
            Proposal & Underwriting Pipeline
          </h1>
          <p className="text-xs text-[#687788]">
            Track policies through proposal formulation, external carrier submission, tele-medical exams, and policy issuance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadApplications}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E2E8EF] bg-white hover:bg-[#F7F9FB] text-[#142D4E] text-xs font-semibold shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Pipeline</span>
          </button>
        </div>
      </div>

      {/* Sync Toast Notification */}
      {syncToast && (
        <div className="p-3 rounded-xl bg-[#E8F5F2] border border-[#16856D]/30 text-xs text-[#16856D] font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{syncToast}</span>
          </div>
          <button onClick={() => setSyncToast(null)} className="text-xs text-[#687788]">✕</button>
        </div>
      )}

      {/* Architecture & Underwriting Authority Directive */}
      <div className="p-4 rounded-xl bg-[#E9F1F5] text-xs text-[#142D4E] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#16856D] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            Broker-Controlled vs Insurer-Controlled Workflow Rules
          </p>
          <p className="text-[11px] text-[#182536] leading-relaxed">
            Authorized broker staff can update internal preparation states (e.g. <em>Proposal Drafted, KYC Uploaded</em>). Carrier underwriting decisions (e.g. <em>Underwriting Review, Medicals, Policy Issued</em>) are legally issued by the authorized insurance company and require verified carrier integration sync or manual verification with carrier proposal reference.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8EF] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#687788] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client, application ID, or proposal #..."
            className="w-full h-8 pl-8 pr-3 rounded-lg border border-[#E2E8EF] bg-[#F7F9FB] focus:bg-white focus:border-[#142D4E] focus:outline-none transition-all text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-[#E2E8EF] bg-[#F7F9FB] text-xs font-medium text-[#182536]"
          >
            <option value="ALL">All Stages</option>
            <option value="Proposal Drafted">Proposal Drafted</option>
            <option value="Underwriting Review">Underwriting Review</option>
            <option value="Policy Issued">Policy Issued</option>
          </select>

          <select
            value={insurerFilter}
            onChange={(e) => setInsurerFilter(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-[#E2E8EF] bg-[#F7F9FB] text-xs font-medium text-[#182536]"
          >
            <option value="ALL">All Partner Insurers</option>
            <option value="HDFC Life">HDFC Life</option>
            <option value="ICICI Prudential">ICICI Prudential</option>
            <option value="Max Life">Max Life</option>
            <option value="LIC of India">LIC of India</option>
            <option value="SBI Life">SBI Life</option>
          </select>

          <span className="text-xs text-[#687788] pl-2 border-l border-[#E2E8EF]">
            <strong>{filteredApps.length}</strong> applications
          </span>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl border border-[#E2E8EF] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9FB] border-b border-[#E2E8EF] text-[#687788]">
              <tr>
                <th className="py-3 px-4 font-semibold">App Number & Date</th>
                <th className="py-3 px-4 font-semibold">Policyholder Client</th>
                <th className="py-3 px-4 font-semibold">Insurer & Product</th>
                <th className="py-3 px-4 font-semibold">Carrier Proposal #</th>
                <th className="py-3 px-4 font-semibold">Sum Assured</th>
                <th className="py-3 px-4 font-semibold">Annual Premium</th>
                <th className="py-3 px-4 font-semibold">Underwriting Stage</th>
                <th className="py-3 px-4 font-semibold text-right">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8EF]">
              {filteredApps.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => setInspectApp(app)}
                  className="hover:bg-[#F7F9FB]/70 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-[#142D4E] block">
                      {app.application_number}
                    </span>
                    <span className="text-[10px] text-[#687788]">{app.submitted_date}</span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-[#182536]">
                    {app.client_name}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-[#182536] block">{app.insurer_name}</span>
                    <span className="text-[10px] text-[#687788]">{app.product_name}</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[#142D4E] font-medium">
                    {app.external_insurer_proposal_no || (
                      <span className="text-[#687788] italic text-[11px]">Unsubmitted</span>
                    )}
                    {app.policy_number && (
                      <span className="text-[10px] text-[#16856D] font-bold block">
                        Pol: {app.policy_number}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-[#142D4E]">
                    ₹{(app.sum_assured / 100000).toFixed(0)} Lakh
                  </td>

                  <td className="py-3.5 px-4 font-bold text-[#16856D]">
                    ₹{app.annual_premium.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleSyncInsurer(app)}
                        disabled={syncingId === app.id}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded border border-[#E2E8EF] hover:bg-[#E9F1F5] text-[#142D4E] flex items-center gap-1"
                        title="Ping Carrier API for Status"
                      >
                        <RefreshCw className={`w-3 h-3 ${syncingId === app.id ? 'animate-spin' : ''}`} />
                        <span>Sync</span>
                      </button>

                      {/* Transition button */}
                      {app.status !== 'Policy Issued' && (
                        <button
                          onClick={() => handleOpenInsurerVerification(app, 'Policy Issued')}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-[#142D4E] text-white hover:bg-[#1D3D5C]"
                        >
                          Verify Issue
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT APPLICATION MODAL */}
      {inspectApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E2E8EF] max-w-lg w-full p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8EF]">
              <div>
                <span className="font-mono font-bold text-xs text-[#142D4E]">
                  {inspectApp.application_number}
                </span>
                <h3 className="text-base font-bold text-[#142D4E] font-['Manrope']">
                  Proposal Tracking Dossier
                </h3>
              </div>
              <button onClick={() => setInspectApp(null)} className="text-[#687788] hover:text-[#182536]">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-[#F7F9FB] p-3.5 rounded-xl border border-[#E2E8EF]">
              <div>
                <span className="text-[#687788] block text-[10px]">Policyholder</span>
                <span className="font-bold text-[#182536]">{inspectApp.client_name}</span>
              </div>
              <div>
                <span className="text-[#687788] block text-[10px]">Partner Insurer</span>
                <span className="font-bold text-[#142D4E]">{inspectApp.insurer_name}</span>
              </div>
              <div>
                <span className="text-[#687788] block text-[10px]">External Insurer Proposal #</span>
                <span className="font-mono font-bold text-[#182536]">
                  {inspectApp.external_insurer_proposal_no || 'Pending Submission'}
                </span>
              </div>
              <div>
                <span className="text-[#687788] block text-[10px]">Current Underwriting Stage</span>
                <span className="font-bold text-[#16856D]">{inspectApp.status}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-[#182536]">Underwriting & Processing Notes</span>
              <p className="p-3 rounded-lg border border-[#E2E8EF] bg-white text-[#687788] leading-relaxed">
                {inspectApp.underwriting_notes || 'Standard underwriting guidelines applied.'}
              </p>
            </div>

            {/* Quick Transition Options */}
            <div className="space-y-1.5 pt-2 border-t border-[#E2E8EF]">
              <span className="font-semibold text-[#182536] block">Transition Underwriting State:</span>
              <div className="flex flex-wrap gap-1.5">
                {ALL_APPLICATION_STAGES.filter((st) => st !== inspectApp.status).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setInspectApp(null)
                      handleOpenInsurerVerification(inspectApp, st)
                    }}
                    className="px-2 py-1 rounded text-[11px] font-semibold border border-[#E2E8EF] hover:bg-[#E9F1F5] text-[#142D4E]"
                  >
                    &rarr; {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#E2E8EF] flex justify-end">
              <button
                onClick={() => setInspectApp(null)}
                className="px-4 py-2 rounded-lg bg-[#142D4E] text-white font-semibold text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VERIFIED INSURER STATUS TRANSITION MODAL */}
      {verifyModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E2E8EF] max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8EF]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#16856D]">
                  Carrier Audit Gate
                </span>
                <h3 className="text-base font-bold text-[#142D4E] font-['Manrope']">
                  Verify Insurer State: {targetStatus}
                </h3>
              </div>
              <button onClick={() => setVerifyModalApp(null)} className="text-[#687788] hover:text-[#182536]">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmVerification} className="space-y-3">
              <div>
                <label className="block font-semibold text-[#182536] mb-1">
                  External Insurer Proposal Number *
                </label>
                <input
                  type="text"
                  required
                  value={verificationProposalNo}
                  onChange={(e) => setVerificationProposalNo(e.target.value)}
                  placeholder="e.g. HDFC-PROP-88102"
                  className="w-full h-8 px-3 rounded-lg border border-[#E2E8EF] font-mono text-xs focus:outline-none focus:border-[#142D4E]"
                />
              </div>

              {targetStatus === 'Policy Issued' && (
                <div>
                  <label className="block font-semibold text-[#182536] mb-1">
                    Carrier Issued Policy Bond Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={verificationPolicyNo}
                    onChange={(e) => setVerificationPolicyNo(e.target.value)}
                    placeholder="e.g. POL-HDFC-991820"
                    className="w-full h-8 px-3 rounded-lg border border-[#E2E8EF] font-mono text-xs focus:outline-none focus:border-[#142D4E]"
                  />
                  <p className="text-[10px] text-[#16856D] mt-0.5">
                    * Policy issuance automatically accrues broker commission according to IRDAI schedule.
                  </p>
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#182536] mb-1">
                  Verification Audit Notes & Underwriting Clearance *
                </label>
                <textarea
                  required
                  rows={3}
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Carrier approval confirmed via portal sync..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8EF] text-xs resize-none focus:outline-none focus:border-[#142D4E]"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E8EF] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setVerifyModalApp(null)}
                  className="px-3 py-1.5 rounded-lg border border-[#E2E8EF] text-[#687788] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white font-semibold shadow-xs"
                >
                  Commit Verified Stage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
