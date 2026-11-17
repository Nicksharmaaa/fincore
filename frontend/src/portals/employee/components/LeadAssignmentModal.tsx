import React, { useState, useEffect } from 'react'
import {
  Users,
  Shield,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  X,
  History,
  AlertCircle,
  Building,
  RefreshCw,
} from 'lucide-react'
import {
  fetchAdvisorsWorkloadAPI,
  getAssignmentRecommendationsAPI,
  autoAssignLeadAPI,
  reassignLeadAPI,
  fetchAssignmentHistoryAPI,
  type AdvisorWorkload,
  type RecommendationResult,
  type LeadAssignmentItem,
} from '../../../services/api'

interface LeadAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  leadId: string
  leadNumber: string
  customerName: string
  productInterest: string
  sumAssured: number
  customerCity?: string
  currentAssigneeName?: string
  onAssigned?: (newAssigneeName: string) => void
}

export const LeadAssignmentModal: React.FC<LeadAssignmentModalProps> = ({
  isOpen,
  onClose,
  leadId,
  leadNumber,
  customerName,
  productInterest,
  sumAssured,
  customerCity = 'Mumbai',
  currentAssigneeName = 'Unassigned',
  onAssigned,
}) => {
  const [activeTab, setActiveTab] = useState<'intelligent' | 'override' | 'history'>('intelligent')
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([])
  const [advisors, setAdvisors] = useState<AdvisorWorkload[]>([])
  const [history, setHistory] = useState<LeadAssignmentItem[]>([])
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>('')
  const [overrideReason, setOverrideReason] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen, leadId])

  const loadData = async () => {
    setLoading(true)
    setSuccessMsg(null)
    try {
      const [recs, advs, hist] = await Promise.all([
        getAssignmentRecommendationsAPI(leadId),
        fetchAdvisorsWorkloadAPI(),
        fetchAssignmentHistoryAPI(leadId),
      ])
      setRecommendations(recs)
      setAdvisors(advs)
      setHistory(hist)
      if (advs.length > 0) {
        setSelectedAdvisorId(advs[0].user_id)
      }
    } catch (err) {
      console.error('Failed to load assignment data', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAutoAssign = async (rec: RecommendationResult) => {
    setSubmitting(true)
    try {
      const res = await autoAssignLeadAPI(leadId)
      setSuccessMsg(`Lead successfully assigned to ${res.assigned_to || rec.advisor.full_name}!`)
      if (onAssigned) onAssigned(res.assigned_to || rec.advisor.full_name)
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      console.error('Auto assign error', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleManagerOverride = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAdvisorId) return
    setSubmitting(true)
    try {
      const targetAdv = advisors.find((a) => a.user_id === selectedAdvisorId)
      const targetName = targetAdv ? targetAdv.full_name : 'Selected Advisor'
      await reassignLeadAPI(leadId, selectedAdvisorId, overrideReason || 'Manager manual reallocation')
      setSuccessMsg(`Lead successfully reassigned to ${targetName}!`)
      if (onAssigned) onAssigned(targetName)
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      console.error('Manager override error', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl border border-[#E2E8EF] max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#142D4E] text-white flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#16856D] text-white px-2 py-0.5 rounded">
                Lead Distribution Engine
              </span>
              <span className="text-xs text-white/70 font-mono">{leadNumber}</span>
            </div>
            <h3 className="text-base font-bold font-['Manrope'] mt-0.5">
              Intelligent Lead Assignment: {customerName}
            </h3>
            <p className="text-[11px] text-white/70">
              Target: {productInterest} &bull; Cover: ₹{(sumAssured / 100000).toFixed(0)} Lakh &bull; City: {customerCity}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Assignee Pill */}
        <div className="px-6 py-2.5 bg-[#E9F1F5] border-b border-[#E2E8EF] flex items-center justify-between text-xs text-[#142D4E]">
          <span className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-[#16856D]" />
            <span>Currently Assigned To:</span>
            <strong className="text-[#182536] font-bold">{currentAssigneeName}</strong>
          </span>
          <span className="text-[11px] text-[#687788]">
            Multi-Criteria Match: Workload, Product Fit, Geography & Language
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E2E8EF] px-6 bg-[#F7F9FB] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('intelligent')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'intelligent'
                ? 'border-[#16856D] text-[#142D4E]'
                : 'border-transparent text-[#687788] hover:text-[#182536]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#16856D]" />
            <span>AI Match Recommendations</span>
          </button>

          <button
            onClick={() => setActiveTab('override')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'override'
                ? 'border-[#16856D] text-[#142D4E]'
                : 'border-transparent text-[#687788] hover:text-[#182536]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Manager Manual Override</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'history'
                ? 'border-[#16856D] text-[#142D4E]'
                : 'border-transparent text-[#687788] hover:text-[#182536]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Assignment History ({history.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {successMsg && (
            <div className="p-3 rounded-xl bg-[#E8F5F2] border border-[#16856D]/30 text-xs text-[#16856D] font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
              <RefreshCw className="w-5 h-5 text-[#16856D] animate-spin" />
              <p className="text-xs text-[#687788]">Evaluating advisor workloads and specialisations...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: AI RECOMMENDATIONS */}
              {activeTab === 'intelligent' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#687788]">
                    <span>Ranked by multi-dimensional match score</span>
                    <span>{recommendations.length} Advisors Evaluated</span>
                  </div>

                  <div className="space-y-3">
                    {recommendations.map((rec, i) => (
                      <div
                        key={rec.advisor.user_id}
                        className={`p-4 rounded-xl border transition-all ${
                          rec.is_recommended
                            ? 'border-[#16856D] bg-[#F7FBF9] shadow-xs'
                            : 'border-[#E2E8EF] bg-white hover:border-[#142D4E]/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-[#142D4E] font-['Manrope']">
                                {rec.advisor.full_name}
                              </span>
                              {rec.is_recommended && (
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#16856D] text-white px-2 py-0.2 rounded">
                                  Top Recommendation
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#687788]">
                              {rec.advisor.designation} &bull; {rec.advisor.branch}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-xl font-black text-[#16856D] font-['Manrope'] block">
                              {rec.match_score}%
                            </span>
                            <span className="text-[10px] text-[#687788]">Match Score</span>
                          </div>
                        </div>

                        {/* Factors Breakdown */}
                        <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-[#E2E8EF]/80 text-[11px]">
                          <div>
                            <span className="text-[#687788] block text-[10px]">Workload</span>
                            <span className="font-semibold text-[#182536]">
                              {rec.advisor.active_leads_count} Leads
                            </span>
                          </div>
                          <div>
                            <span className="text-[#687788] block text-[10px]">Specialization</span>
                            <span className="font-semibold text-[#182536] truncate block" title={rec.advisor.specialisation}>
                              {rec.advisor.specialisation.split(',')[0]}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#687788] block text-[10px]">Branch / Geo</span>
                            <span className="font-semibold text-[#182536]">{rec.advisor.branch.split(' - ')[0]}</span>
                          </div>
                          <div>
                            <span className="text-[#687788] block text-[10px]">Languages</span>
                            <span className="font-semibold text-[#182536]">
                              {rec.advisor.languages.slice(0, 2).join(', ')}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-dashed border-[#E2E8EF]">
                          <p className="text-[11px] text-[#687788] italic">
                            Rationale: {rec.reason}
                          </p>
                          <button
                            disabled={submitting}
                            onClick={() => handleAutoAssign(rec)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            <span>Assign</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: MANAGER OVERRIDE */}
              {activeTab === 'override' && (
                <form onSubmit={handleManagerOverride} className="space-y-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#FDF7EE] border border-[#C58A36]/30 text-[#182536] space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-[#C58A36]">
                      <AlertCircle className="w-4 h-4" />
                      <span>Managerial Override Control</span>
                    </p>
                    <p className="text-[11px] text-[#687788] leading-relaxed">
                      Reallocating outside the automated scoring algorithm requires specifying an operational business reason. This will be permanently recorded in the broker audit trail.
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#182536] mb-1.5">
                      Select Target Relationship Manager / Advisor *
                    </label>
                    <select
                      value={selectedAdvisorId}
                      onChange={(e) => setSelectedAdvisorId(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-[#E2E8EF] bg-white focus:outline-none focus:border-[#142D4E] text-xs"
                    >
                      {advisors.map((adv) => (
                        <option key={adv.user_id} value={adv.user_id}>
                          {adv.full_name} ({adv.designation}) &bull; {adv.active_leads_count} active leads
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#182536] mb-1.5">
                      Manager Override Rationale / Instruction *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="e.g. Assigned per corporate relationship request from client's chartered accountant. Handled by senior desk."
                      className="w-full p-3 rounded-lg border border-[#E2E8EF] bg-white focus:outline-none focus:border-[#142D4E] text-xs resize-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3.5 py-2 rounded-lg border border-[#E2E8EF] text-[#687788] font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !overrideReason.trim()}
                      className="px-4 py-2 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white font-semibold shadow-xs disabled:opacity-50"
                    >
                      {submitting ? 'Applying Reassignment...' : 'Confirm Manager Override'}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: ASSIGNMENT HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-3">
                  {history.length === 0 ? (
                    <p className="text-xs text-[#687788] py-8 text-center">
                      No prior reassignments recorded for this lead.
                    </p>
                  ) : (
                    <div className="divide-y divide-[#E2E8EF] border border-[#E2E8EF] rounded-xl overflow-hidden bg-white text-xs">
                      {history.map((h) => (
                        <div key={h.id} className="p-3.5 space-y-1 hover:bg-[#F7F9FB] transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#142D4E]">
                              Assigned to {h.assigned_to_name}
                            </span>
                            <span className="text-[10px] text-[#687788] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {h.timestamp}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#687788]">
                            Assigned by: <strong>{h.assigned_by_name}</strong>
                          </p>
                          <p className="text-[11px] text-[#182536] bg-[#F7F9FB] p-2 rounded-lg border border-[#E2E8EF]">
                            Reason: {h.reason || 'Direct intake routing'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#F7F9FB] border-t border-[#E2E8EF] flex items-center justify-between text-xs text-[#687788] flex-shrink-0">
          <span>IRDAI Compliant Broker Allocation Protocol</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-[#E2E8EF] bg-white text-[#182536] font-semibold hover:bg-[#F7F9FB]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
