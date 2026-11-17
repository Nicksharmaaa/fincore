import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import {
  TrendingUp,
  Users,
  FileText,
  ClipboardList,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Phone,
  Calendar,
  Check,
  Plus,
} from 'lucide-react'
import {
  fetchOverviewMetricsAPI,
  fetchLeadsAPI,
  fetchTasksAPI,
  type CRMLead,
  type CRMTask,
  type LeadLifecycleStatus,
} from '../../../services/api'
import { LeadDetailDrawer } from '../components/LeadDetailDrawer'
import { SalesCopilotDrawer } from '../components/SalesCopilotDrawer'

export const OverviewPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [metrics, setMetrics] = useState({
    assignedLeads: 28,
    newLeads: 6,
    followUpsDue: 4,
    overdueTasks: 1,
    quotationsGenerated: 14,
    applicationsPending: 9,
    issuedPolicies: 18,
    pipelineSumAssured: '₹34.5 Cr',
    conversionRate: '15.2%',
    pipelineCommission: '₹1,64,200',
    isLiveData: false,
  })

  const [leads, setLeads] = useState<CRMLead[]>([])
  const [tasks, setTasks] = useState<CRMTask[]>([])
  const [loading, setLoading] = useState(true)

  // Drawer / modal states
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [copilotOpen, setCopilotOpen] = useState(false)

  useEffect(() => {
    loadOverviewData()
  }, [])

  const loadOverviewData = async () => {
    setLoading(true)
    try {
      const [m, l, t] = await Promise.all([
        fetchOverviewMetricsAPI(),
        fetchLeadsAPI(),
        fetchTasksAPI(),
      ])
      setMetrics(m)
      setLeads(l)
      setTasks(t)
    } catch (err) {
      console.error('Failed to load overview data', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'Completed', is_overdue: false } : t))
    )
  }

  // Today's priorities: tasks due today or overdue
  const priorityTasks = tasks.filter((t) => t.status === 'Pending').slice(0, 4)

  return (
    <div className="space-y-6 select-none" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top Banner / Welcome Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8EF]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#16856D] bg-[#E8F5F2] px-2 py-0.5 rounded">
              Brokerage Workspace
            </span>
            <span className="text-[11px] text-[#687788]">
              {metrics.isLiveData ? 'Live PostgreSQL Data' : 'Seed Development Repository'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#142D4E] font-['Manrope'] mt-1">
            Welcome back, {user?.name || 'Authorized Advisor'}
          </h1>
          <p className="text-xs text-[#687788]">
            {user?.department || 'Life Insurance Advisory'} &bull; Branch: {user?.branch || 'Mumbai - BKC'} &bull; Active pipeline status
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCopilotOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#16856D] hover:bg-[#126b57] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Copilot</span>
          </button>
          <button
            onClick={() => navigate('/app/leads')}
            className="px-3.5 py-2 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white text-xs font-semibold transition-colors shadow-xs"
          >
            + New Lead Intake
          </button>
        </div>
      </div>

      {/* KPI Ribbon: High-Density 7 Core Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3.5 rounded-xl border border-[#E2E8EF] bg-white shadow-xs">
          <span className="text-[10px] text-[#687788] font-medium block">Assigned Leads</span>
          <span className="text-xl font-bold text-[#142D4E] font-['Manrope'] block mt-1">
            {metrics.assignedLeads}
          </span>
          <span className="text-[10px] text-[#16856D] font-medium">In your queue</span>
        </div>

        <div className="p-3.5 rounded-xl border border-[#E2E8EF] bg-white shadow-xs">
          <span className="text-[10px] text-[#687788] font-medium block">New Leads</span>
          <span className="text-xl font-bold text-[#16856D] font-['Manrope'] block mt-1">
            {metrics.newLeads}
          </span>
          <span className="text-[10px] text-[#16856D] font-medium">+2 inbound today</span>
        </div>

        <div className="p-3.5 rounded-xl border border-[#E2E8EF] bg-white shadow-xs">
          <span className="text-[10px] text-[#687788] font-medium block">Follow-ups Due</span>
          <span className="text-xl font-bold text-[#142D4E] font-['Manrope'] block mt-1">
            {metrics.followUpsDue}
          </span>
          <span className="text-[10px] text-[#C58A36] font-medium">Due before 6 PM</span>
        </div>

        <div className="p-3.5 rounded-xl border border-[#C44545]/30 bg-[#FDF2F2] shadow-xs">
          <span className="text-[10px] text-[#C44545] font-bold block">Overdue Tasks</span>
          <span className="text-xl font-black text-[#C44545] font-['Manrope'] block mt-1">
            {metrics.overdueTasks}
          </span>
          <span className="text-[10px] text-[#C44545] font-semibold">Immediate action</span>
        </div>

        <div className="p-3.5 rounded-xl border border-[#E2E8EF] bg-white shadow-xs">
          <span className="text-[10px] text-[#687788] font-medium block">Quotes Sent</span>
          <span className="text-xl font-bold text-[#142D4E] font-['Manrope'] block mt-1">
            {metrics.quotationsGenerated}
          </span>
          <span className="text-[10px] text-[#687788]">Active dossiers</span>
        </div>

        <div className="p-3.5 rounded-xl border border-[#E2E8EF] bg-white shadow-xs">
          <span className="text-[10px] text-[#687788] font-medium block">Pending Proposals</span>
          <span className="text-xl font-bold text-[#1D3D5C] font-['Manrope'] block mt-1">
            {metrics.applicationsPending}
          </span>
          <span className="text-[10px] text-[#16856D]">With underwriters</span>
        </div>

        <div className="p-3.5 rounded-xl border border-[#16856D]/30 bg-[#E8F5F2] shadow-xs">
          <span className="text-[10px] text-[#16856D] font-bold block">Issued Policies</span>
          <span className="text-xl font-black text-[#16856D] font-['Manrope'] block mt-1">
            {metrics.issuedPolicies}
          </span>
          <span className="text-[10px] text-[#16856D] font-semibold">{metrics.conversionRate} conv.</span>
        </div>
      </div>

      {/* TODAY'S PRIORITIES SECTION */}
      <div className="p-5 rounded-2xl border border-[#E2E8EF] bg-white shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8EF]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C44545] animate-pulse" />
            <h2 className="text-sm font-bold text-[#142D4E] font-['Manrope'] uppercase tracking-wider">
              Today's Priorities & Action Queue
            </h2>
          </div>
          <Link
            to="/app/tasks"
            className="text-xs font-semibold text-[#142D4E] hover:underline inline-flex items-center gap-1"
          >
            <span>Open Task Manager ({tasks.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {priorityTasks.map((t) => (
            <div
              key={t.id}
              className={`p-3.5 rounded-xl border transition-all space-y-2 flex flex-col justify-between ${
                t.is_overdue
                  ? 'border-[#C44545] bg-[#FDF2F2]'
                  : 'border-[#E2E8EF] bg-[#F7F9FB] hover:border-[#142D4E]'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                      t.is_overdue
                        ? 'bg-[#C44545] text-white'
                        : t.priority === 'Urgent'
                        ? 'bg-[#FDF2F2] text-[#C44545]'
                        : 'bg-[#E9F1F5] text-[#142D4E]'
                    }`}
                  >
                    {t.is_overdue ? 'OVERDUE' : t.priority}
                  </span>
                  <span className="text-[10px] text-[#687788] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {t.due_date}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#182536] line-clamp-1">{t.title}</h4>
                {t.client_name && (
                  <p className="text-[11px] text-[#687788]">Client: <strong>{t.client_name}</strong></p>
                )}
                {t.description && (
                  <p className="text-[11px] text-[#687788] line-clamp-2 leading-relaxed">
                    {t.description}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-[#E2E8EF]/60 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleCompleteTask(t.id)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16856D] hover:underline"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Done</span>
                </button>
                {t.lead_id && (
                  <button
                    onClick={() => setSelectedLeadId(t.lead_id!)}
                    className="text-[11px] font-bold text-[#142D4E] hover:underline"
                  >
                    View Lead &rarr;
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main 2-Column Section: Active Leads Pipeline & Quick Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Lead Pipeline */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#E2E8EF] shadow-xs">
          <div className="p-4 sm:p-5 border-b border-[#E2E8EF] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#142D4E] font-['Manrope']">
                Active Lead Pipeline
              </h2>
              <p className="text-[11px] text-[#687788]">
                Sorted by AI conversion probability & interaction freshness
              </p>
            </div>
            <Link
              to="/app/leads"
              className="text-xs font-semibold text-[#142D4E] hover:underline inline-flex items-center gap-1"
            >
              <span>View all {leads.length} leads</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F9FB] border-b border-[#E2E8EF] text-[#687788]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Lead ID & Customer</th>
                  <th className="py-2.5 px-4 font-semibold">Product Interest</th>
                  <th className="py-2.5 px-4 font-semibold">Sum Assured</th>
                  <th className="py-2.5 px-4 font-semibold">ML Score</th>
                  <th className="py-2.5 px-4 font-semibold">Stage</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8EF]">
                {leads.slice(0, 6).map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className="hover:bg-[#F7F9FB]/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#182536] block">{lead.customer_name}</span>
                      <span className="text-[10px] text-[#687788] font-mono">
                        {lead.lead_number} &bull; {lead.customer_city || 'Mumbai'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#182536] font-medium">{lead.product_interest}</td>
                    <td className="py-3 px-4 font-bold text-[#142D4E]">
                      ₹{(lead.desired_sum_assured / 100000).toFixed(0)} Lakh
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16856D] bg-[#E8F5F2] px-2 py-0.5 rounded">
                        <Sparkles className="w-3 h-3" />
                        <span>{lead.current_ml_score} / 100</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-semibold text-[#142D4E] bg-[#E9F1F5] px-2 py-0.5 rounded">
                        {lead.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedLeadId(lead.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded bg-[#142D4E] text-white hover:bg-[#1D3D5C]"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Brokerage Performance & Compliance */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Metrics Snapshot */}
          <div className="bg-white rounded-xl border border-[#E2E8EF] p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#142D4E] uppercase tracking-wider">
              Brokerage Commercial Pipeline
            </h3>
            <div className="p-3.5 rounded-xl bg-[#F7F9FB] border border-[#E2E8EF] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#687788]">Pipeline Sum Assured</span>
                <span className="font-bold text-[#142D4E]">{metrics.pipelineSumAssured}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#687788]">Pipeline Commission Accrued</span>
                <span className="font-bold text-[#16856D]">{metrics.pipelineCommission}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#687788]">Lead-to-Policy Conversion</span>
                <span className="font-bold text-[#142D4E]">{metrics.conversionRate}</span>
              </div>
            </div>

            <Link
              to="/app/analytics"
              className="block text-center py-1.5 text-xs font-semibold text-[#142D4E] hover:underline"
            >
              View Full Analytics Report &rarr;
            </Link>
          </div>

          {/* IRDAI Statutory Compliance Directive */}
          <div className="p-4 rounded-xl bg-[#E8F5F2] border border-[#16856D]/30 text-xs space-y-2">
            <div className="flex items-center gap-2 text-[#16856D] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>IRDAI Advisory Governance</span>
            </div>
            <p className="text-[#182536] text-[11px] leading-relaxed">
              Every proposal submitted must retain a signed Needs Assessment Form and comparison quotation sheet from at least 3 authorized life insurance providers.
            </p>
          </div>
        </div>
      </div>

      {/* Slide-over Lead Detail Drawer */}
      {selectedLeadId && (
        <LeadDetailDrawer
          isOpen={Boolean(selectedLeadId)}
          onClose={() => setSelectedLeadId(null)}
          leadId={selectedLeadId}
          onStatusUpdated={() => loadOverviewData()}
        />
      )}

      {/* Global AI Copilot */}
      <SalesCopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        initialAction="CUSTOMER_SUMMARY"
      />
    </div>
  )
}
