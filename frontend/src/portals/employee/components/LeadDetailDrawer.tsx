import React, { useState, useEffect } from 'react'
import {
  X,
  Phone,
  Mail,
  User,
  Sparkles,
  ShieldCheck,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  TrendingUp,
  Share2,
  Plus,
} from 'lucide-react'
import {
  fetchLeadDetailAPI,
  updateLeadStatusAPI,
  logLeadActivityAPI,
  createTaskAPI,
  type LeadDetailData,
  type LeadLifecycleStatus,
} from '../../../services/api'
import { LeadAssignmentModal } from './LeadAssignmentModal'
import { SalesCopilotDrawer } from './SalesCopilotDrawer'

interface LeadDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  leadId: string
  onStatusUpdated?: (leadId: string, newStatus: LeadLifecycleStatus) => void
}

const LIFECYCLE_STAGES: LeadLifecycleStatus[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'QUOTE_REQUESTED',
  'QUOTE_SENT',
  'APPLICATION_IN_PROGRESS',
  'CONVERTED',
  'LOST',
]

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  isOpen,
  onClose,
  leadId,
  onStatusUpdated,
}) => {
  const [detail, setDetail] = useState<LeadDetailData | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'activity' | 'log_call' | 'schedule_task'>('activity')

  // Log interaction form state
  const [activityType, setActivityType] = useState<'CALL' | 'EMAIL' | 'NOTE' | 'MEETING'>('CALL')
  const [activityTitle, setActivityTitle] = useState('')
  const [activityNotes, setActivityNotes] = useState('')

  // Task form state
  const [taskTitle, setTaskTitle] = useState('')
  const [taskPriority, setTaskPriority] = useState<'Urgent' | 'High' | 'Medium' | 'Normal'>('High')
  const [taskDue, setTaskDue] = useState('Today, 5:00 PM')

  // Modals state
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [copilotAction, setCopilotAction] = useState<'CUSTOMER_SUMMARY' | 'PRODUCT_SUGGESTION' | 'POLICY_WORDING' | 'DRAFT_MESSAGE' | 'CALL_PREPARATION'>('CUSTOMER_SUMMARY')
  const [lostReasonModalOpen, setLostReasonModalOpen] = useState(false)
  const [lostReason, setLostReason] = useState('Client opted for lower-tier group cover')

  useEffect(() => {
    if (isOpen && leadId) {
      loadLeadDetail()
    }
  }, [isOpen, leadId])

  const loadLeadDetail = async () => {
    setLoading(true)
    try {
      const data = await fetchLeadDetailAPI(leadId)
      setDetail(data)
    } catch (err) {
      console.error('Failed to load lead details', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStageChange = async (targetStatus: LeadLifecycleStatus) => {
    if (targetStatus === 'LOST') {
      setLostReasonModalOpen(true)
      return
    }
    if (!detail) return
    const prevStatus = detail.status
    setDetail({ ...detail, status: targetStatus })
    try {
      await updateLeadStatusAPI(detail.id, targetStatus)
      if (onStatusUpdated) onStatusUpdated(detail.id, targetStatus)
      // Log status change activity
      await logLeadActivityAPI(
        detail.id,
        'NOTE',
        `Pipeline Stage: ${targetStatus}`,
        `Transitioned from ${prevStatus} to ${targetStatus}`
      )
      loadLeadDetail()
    } catch (err) {
      console.error('Status transition error', err)
    }
  }

  const handleConfirmLost = async () => {
    if (!detail) return
    setLostReasonModalOpen(false)
    setDetail({ ...detail, status: 'LOST', lost_reason: lostReason })
    try {
      await updateLeadStatusAPI(detail.id, 'LOST', lostReason)
      if (onStatusUpdated) onStatusUpdated(detail.id, 'LOST')
      await logLeadActivityAPI(
        detail.id,
        'NOTE',
        'Lead Marked as Lost',
        `Reason: ${lostReason}`
      )
      loadLeadDetail()
    } catch (err) {
      console.error('Failed to mark lost', err)
    }
  }

  const handleLogInteraction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!detail || !activityTitle.trim()) return
    try {
      await logLeadActivityAPI(detail.id, activityType, activityTitle, activityNotes)
      setActivityTitle('')
      setActivityNotes('')
      setActiveTab('activity')
      loadLeadDetail()
    } catch (err) {
      console.error('Log interaction error', err)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!detail || !taskTitle.trim()) return
    try {
      await createTaskAPI({
        lead_id: detail.id,
        title: taskTitle,
        priority: taskPriority,
        due_date: taskDue,
      })
      setTaskTitle('')
      setActiveTab('activity')
      loadLeadDetail()
    } catch (err) {
      console.error('Create task error', err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div
        className="relative w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col z-10 border-l border-[#E2E8EF]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Header */}
        <div className="h-16 px-6 bg-[#142D4E] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm tracking-wider text-white">
                  {detail?.lead_number || 'LD-XXXX'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#16856D] text-white px-2 py-0.5 rounded">
                  {detail?.status || 'NEW'}
                </span>
              </div>
              <p className="text-[11px] text-white/70">
                Created: {detail?.created_at ? new Date(detail.created_at).toLocaleDateString('en-IN') : 'Recent'} &bull; Source: {detail?.source}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCopilotAction('CUSTOMER_SUMMARY')
                setCopilotOpen(true)
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16856D] hover:bg-[#126b57] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Copilot</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 8-Stage Lifecycle Stepper Ribbon */}
        <div className="bg-[#10243E] px-6 py-2.5 border-b border-[#1D3D5C] overflow-x-auto scrollbar-none flex-shrink-0">
          <div className="flex items-center gap-1 min-w-max text-[10px]">
            {LIFECYCLE_STAGES.map((st, i) => {
              const isCurrent = detail?.status === st
              const isLost = detail?.status === 'LOST' && st === 'LOST'

              return (
                <button
                  key={st}
                  onClick={() => handleStageChange(st)}
                  className={`px-2 py-1 rounded font-semibold transition-colors flex items-center gap-1 ${
                    isCurrent
                      ? isLost
                        ? 'bg-[#C44545] text-white font-bold'
                        : 'bg-[#16856D] text-white font-bold'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                  title={`Click to set stage to ${st}`}
                >
                  <span>{st.replace(/_/g, ' ')}</span>
                  {i < LIFECYCLE_STAGES.length - 1 && <span className="text-white/20 ml-1">&rsaquo;</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Lead Summary Sub-Ribbon */}
        <div className="bg-[#E9F1F5] px-6 py-2.5 border-b border-[#E2E8EF] flex items-center justify-between text-xs text-[#142D4E] flex-shrink-0">
          <div className="flex items-center gap-4">
            <span>
              Assigned Advisor:{' '}
              <strong className="text-[#182536]">{detail?.assigned_user_name || 'Unassigned'}</strong>
            </span>
            <button
              onClick={() => setAssignmentModalOpen(true)}
              className="text-[11px] font-bold text-[#16856D] hover:underline"
            >
              Reassign &rarr;
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#687788]">Conversion Score:</span>
            <span className="text-xs font-bold text-[#16856D] bg-[#E8F5F2] px-2 py-0.5 rounded flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{detail?.current_ml_score || 75} / 100</span>
            </span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Customer Snapshot Box */}
          <div className="p-4 rounded-xl border border-[#E2E8EF] bg-[#F7F9FB] space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#16856D]">
                  Customer Profile
                </span>
                <h4 className="text-sm font-bold text-[#142D4E] font-['Manrope']">
                  {detail?.customer?.full_name || detail?.customer_name}
                </h4>
                <p className="text-xs text-[#687788]">
                  {detail?.customer?.city || detail?.customer_city} &bull; {detail?.customer?.segment || 'Retail Client'}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <a
                  href={`tel:${detail?.customer?.phone || detail?.customer_phone}`}
                  className="p-2 rounded-lg bg-white border border-[#E2E8EF] hover:border-[#142D4E] text-[#142D4E] transition-colors"
                  title="Direct Call"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
                <a
                  href={`mailto:${detail?.customer?.email || detail?.customer_email}`}
                  className="p-2 rounded-lg bg-white border border-[#E2E8EF] hover:border-[#142D4E] text-[#142D4E] transition-colors"
                  title="Direct Email"
                >
                  <Mail className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2 border-t border-[#E2E8EF]">
              <div>
                <span className="text-[10px] text-[#687788] block">Phone</span>
                <span className="font-semibold text-[#182536]">{detail?.customer?.phone || detail?.customer_phone}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#687788] block">Annual Income</span>
                <span className="font-semibold text-[#182536]">
                  {detail?.customer?.annual_income ? `₹${detail.customer.annual_income.toLocaleString('en-IN')}` : '₹15,00,000'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#687788] block">Smoker Status</span>
                <span className="font-semibold text-[#182536]">
                  {detail?.customer?.smoker_status ? 'Smoker (Loaded)' : 'Non-Smoker (Standard)'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#687788] block">KYC Status</span>
                <span className="font-bold text-[#16856D]">{detail?.customer?.kyc_status || 'Verified'}</span>
              </div>
            </div>
          </div>

          {/* Insurance Requirement & Needs Assessment Snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[#E2E8EF] bg-white space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#687788]">
                Product Interest
              </span>
              <p className="text-xs font-bold text-[#142D4E]">{detail?.product_interest}</p>
              <p className="text-xs text-[#687788]">
                Target Sum Assured:{' '}
                <strong className="text-[#142D4E]">
                  ₹{detail ? (detail.desired_sum_assured / 100000).toFixed(0) : '100'} Lakh
                </strong>
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#16856D]/30 bg-[#E8F5F2] space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#16856D]">
                Assessed HLV Deficit (Gap)
              </span>
              <p className="text-base font-black text-[#142D4E] font-['Manrope']">
                {detail?.assessment ? `₹${(detail.assessment.coverage_gap / 10000000).toFixed(2)} Cr` : '₹2.25 Cr'}
              </p>
              <p className="text-[11px] text-[#182536]">
                Formula: 12x Income + Debt minus Declared Cover
              </p>
            </div>
          </div>

          {/* Action Tabs: Interaction Logs, Log Call Form, Schedule Task Form */}
          <div className="space-y-4">
            <div className="flex border-b border-[#E2E8EF] text-xs font-semibold">
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-2 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'activity'
                    ? 'border-[#142D4E] text-[#142D4E]'
                    : 'border-transparent text-[#687788] hover:text-[#182536]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Interaction Timeline ({detail?.activities?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('log_call')}
                className={`py-2 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'log_call'
                    ? 'border-[#142D4E] text-[#142D4E]'
                    : 'border-transparent text-[#687788] hover:text-[#182536]'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>+ Log Call / Note</span>
              </button>

              <button
                onClick={() => setActiveTab('schedule_task')}
                className={`py-2 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'schedule_task'
                    ? 'border-[#142D4E] text-[#142D4E]'
                    : 'border-transparent text-[#687788] hover:text-[#182536]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>+ Schedule Callback</span>
              </button>
            </div>

            {/* TAB 1: ACTIVITY TIMELINE */}
            {activeTab === 'activity' && (
              <div className="space-y-3">
                {detail?.activities && detail.activities.length > 0 ? (
                  <div className="divide-y divide-[#E2E8EF] border border-[#E2E8EF] rounded-xl overflow-hidden bg-white text-xs">
                    {detail.activities.map((act) => (
                      <div key={act.id} className="p-3.5 hover:bg-[#F7F9FB] transition-colors space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#182536] flex items-center gap-1.5">
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-[#E9F1F5] text-[#142D4E]">
                              {act.activity_type}
                            </span>
                            <span>{act.title}</span>
                          </span>
                          <span className="text-[10px] text-[#687788]">{act.occurred_at}</span>
                        </div>
                        {act.notes && (
                          <p className="text-[11px] text-[#687788] leading-relaxed pt-0.5">
                            {act.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#687788] text-center py-6">
                    No activity notes recorded yet. Use the tab above to log calls or meetings.
                  </p>
                )}
              </div>
            )}

            {/* TAB 2: LOG CALL / INTERACTION FORM */}
            {activeTab === 'log_call' && (
              <form onSubmit={handleLogInteraction} className="p-4 rounded-xl border border-[#E2E8EF] bg-white space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#182536] mb-1">Interaction Type *</label>
                    <select
                      value={activityType}
                      onChange={(e) => setActivityType(e.target.value as any)}
                      className="w-full h-8 px-2 rounded-lg border border-[#E2E8EF] bg-white"
                    >
                      <option value="CALL">Advisory Call</option>
                      <option value="EMAIL">Email Sent</option>
                      <option value="MEETING">Video / In-person Meeting</option>
                      <option value="NOTE">General CRM Note</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-[#182536] mb-1">Subject / Headline *</label>
                    <input
                      type="text"
                      required
                      value={activityTitle}
                      onChange={(e) => setActivityTitle(e.target.value)}
                      placeholder="e.g. Discussed HDFC vs ICICI wording"
                      className="w-full h-8 px-3 rounded-lg border border-[#E2E8EF] bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#182536] mb-1">Discussion Notes & Next Steps</label>
                  <textarea
                    rows={3}
                    value={activityNotes}
                    onChange={(e) => setActivityNotes(e.target.value)}
                    placeholder="Enter customer objections, agreed sum assured, or document collection commitment..."
                    className="w-full p-2.5 rounded-lg border border-[#E2E8EF] bg-white resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('activity')}
                    className="px-3 py-1.5 rounded-lg border border-[#E2E8EF] text-[#687788]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#142D4E] text-white font-semibold shadow-xs"
                  >
                    Save Activity Note
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: SCHEDULE TASK / CALLBACK FORM */}
            {activeTab === 'schedule_task' && (
              <form onSubmit={handleCreateTask} className="p-4 rounded-xl border border-[#E2E8EF] bg-white space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#182536] mb-1">Task Title *</label>
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Follow-up on 3-year ITR submission for ₹2 Cr cover"
                    className="w-full h-8 px-3 rounded-lg border border-[#E2E8EF] bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#182536] mb-1">Priority</label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as any)}
                      className="w-full h-8 px-2 rounded-lg border border-[#E2E8EF] bg-white"
                    >
                      <option value="Urgent">Urgent</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Normal">Normal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-[#182536] mb-1">Due Date & Time *</label>
                    <input
                      type="text"
                      required
                      value={taskDue}
                      onChange={(e) => setTaskDue(e.target.value)}
                      placeholder="e.g. Today, 4:30 PM or 18-Nov-2026"
                      className="w-full h-8 px-3 rounded-lg border border-[#E2E8EF] bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('activity')}
                    className="px-3 py-1.5 rounded-lg border border-[#E2E8EF] text-[#687788]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#142D4E] text-white font-semibold shadow-xs"
                  >
                    Schedule Callback
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8EF] bg-[#F7F9FB] flex items-center justify-between text-xs flex-shrink-0">
          <button
            onClick={() => {
              setCopilotAction('DRAFT_MESSAGE')
              setCopilotOpen(true)
            }}
            className="inline-flex items-center gap-1.5 text-[#142D4E] font-semibold hover:underline"
          >
            <Mail className="w-3.5 h-3.5 text-[#16856D]" />
            <span>Generate Client Message Draft</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#142D4E] text-white font-semibold hover:bg-[#1D3D5C]"
          >
            Done
          </button>
        </div>
      </div>

      {/* Assignment Modal */}
      {detail && (
        <LeadAssignmentModal
          isOpen={assignmentModalOpen}
          onClose={() => setAssignmentModalOpen(false)}
          leadId={detail.id}
          leadNumber={detail.lead_number}
          customerName={detail.customer?.full_name || detail.customer_name || 'Prospect'}
          productInterest={detail.product_interest}
          sumAssured={detail.desired_sum_assured}
          customerCity={detail.customer?.city || detail.customer_city}
          currentAssigneeName={detail.assigned_user_name}
          onAssigned={(newAdvisor) => {
            setDetail({ ...detail, assigned_user_name: newAdvisor })
            loadLeadDetail()
          }}
        />
      )}

      {/* Copilot Drawer */}
      {detail && (
        <SalesCopilotDrawer
          isOpen={copilotOpen}
          onClose={() => setCopilotOpen(false)}
          leadId={detail.id}
          customerId={detail.customer_id}
          initialAction={copilotAction}
        />
      )}

      {/* Lost Reason Modal */}
      {lostReasonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-[#E2E8EF] max-w-sm w-full p-5 space-y-3 shadow-xl">
            <h4 className="text-sm font-bold text-[#142D4E]">Specify Reason for Lost Lead</h4>
            <p className="text-xs text-[#687788]">
              IRDAI brokerage records require tracking why prospective clients chose not to proceed.
            </p>
            <select
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
              className="w-full h-8 px-2 rounded-lg border border-[#E2E8EF] bg-white text-xs"
            >
              <option value="Client opted for lower-tier company group cover">Client opted for lower-tier company group cover</option>
              <option value="Purchased directly through offline insurer branch">Purchased directly through offline insurer branch</option>
              <option value="Postponed decision due to medical requirement apprehension">Postponed decision due to medical requirement apprehension</option>
              <option value="Budget constraint / Premium mismatch">Budget constraint / Premium mismatch</option>
              <option value="Customer unreachable after 5+ contact attempts">Customer unreachable after 5+ contact attempts</option>
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setLostReasonModalOpen(false)}
                className="px-3 py-1.5 text-xs text-[#687788]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLost}
                className="px-4 py-1.5 rounded-lg bg-[#C44545] text-white text-xs font-semibold"
              >
                Confirm Lost Stage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
