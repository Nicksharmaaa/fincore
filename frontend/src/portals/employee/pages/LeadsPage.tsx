import React, { useState, useMemo, useEffect } from 'react'
import {
  TrendingUp,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  Sparkles,
  ArrowRight,
  FileText,
  User,
  CheckCircle2,
  Columns,
  List,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react'
import {
  fetchLeadsAPI,
  updateLeadStatusAPI,
  type CRMLead,
  type LeadLifecycleStatus,
} from '../../../services/api'
import { LeadDetailDrawer } from '../components/LeadDetailDrawer'
import { LeadAssignmentModal } from '../components/LeadAssignmentModal'
import { SalesCopilotDrawer } from '../components/SalesCopilotDrawer'

const LIFECYCLE_STATUSES: LeadLifecycleStatus[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'QUOTE_REQUESTED',
  'QUOTE_SENT',
  'APPLICATION_IN_PROGRESS',
  'CONVERTED',
  'LOST',
]

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<CRMLead[]>([])
  const [loading, setLoading] = useState(true)

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL')
  const [advisorFilter, setAdvisorFilter] = useState<string>('ALL')
  const [sourceFilter, setSourceFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<'ml_score' | 'date' | 'sum_assured'>('ml_score')

  // View mode
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Modals / Drawers
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [assigningLead, setAssigningLead] = useState<CRMLead | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [copilotOpen, setCopilotOpen] = useState(false)

  // New lead intake form state
  const [newCustName, setNewCustName] = useState('')
  const [newCustPhone, setNewCustPhone] = useState('')
  const [newCustEmail, setNewCustEmail] = useState('')
  const [newCustCity, setNewCustCity] = useState('Mumbai')
  const [newProduct, setNewProduct] = useState('Click 2 Protect Super (HDFC Life)')
  const [newSumAssured, setNewSumAssured] = useState(15000000)
  const [newSource, setNewSource] = useState('DIRECT')

  useEffect(() => {
    loadLeads()
  }, [])

  const loadLeads = async () => {
    setLoading(true)
    try {
      const data = await fetchLeadsAPI()
      setLeads(data)
    } catch (err) {
      console.error('Failed to load leads', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort
  const filteredLeads = useMemo(() => {
    let result = [...leads]

    // Status
    if (statusFilter !== 'ALL') {
      result = result.filter((l) => l.status === statusFilter)
    }

    // Priority
    if (priorityFilter === 'HIGH') {
      result = result.filter((l) => l.current_ml_score >= 80)
    } else if (priorityFilter === 'MEDIUM') {
      result = result.filter((l) => l.current_ml_score >= 60 && l.current_ml_score < 80)
    }

    // Advisor
    if (advisorFilter !== 'ALL') {
      result = result.filter((l) => l.assigned_user_name?.toLowerCase().includes(advisorFilter.toLowerCase()))
    }

    // Source
    if (sourceFilter !== 'ALL') {
      result = result.filter((l) => l.source === sourceFilter)
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (l) =>
          l.lead_number.toLowerCase().includes(q) ||
          (l.customer_name && l.customer_name.toLowerCase().includes(q)) ||
          (l.customer_phone && l.customer_phone.includes(q)) ||
          (l.customer_city && l.customer_city.toLowerCase().includes(q)) ||
          l.product_interest.toLowerCase().includes(q)
      )
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'ml_score') return b.current_ml_score - a.current_ml_score
      if (sortBy === 'sum_assured') return b.desired_sum_assured - a.desired_sum_assured
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return result
  }, [leads, statusFilter, priorityFilter, advisorFilter, sourceFilter, searchQuery, sortBy])

  // Pagination calculation
  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredLeads.slice(start, start + pageSize)
  }, [filteredLeads, currentPage])

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault()
    const newLead: CRMLead = {
      id: `lead-${Date.now()}`,
      lead_number: `LD-${1093 + leads.length}`,
      customer_id: `cust-${Date.now()}`,
      customer_name: newCustName,
      customer_phone: newCustPhone,
      customer_email: newCustEmail,
      customer_city: newCustCity,
      product_interest: newProduct,
      desired_sum_assured: newSumAssured,
      source: newSource,
      status: 'NEW',
      assigned_user_name: 'Rahul Sharma',
      current_ml_score: 75,
      created_at: new Date().toISOString(),
    }
    setLeads([newLead, ...leads])
    setShowAddModal(false)
    setNewCustName('')
    setNewCustPhone('')
    setNewCustEmail('')
  }

  const handleAdvanceStatus = async (leadId: string, currentStatus: LeadLifecycleStatus) => {
    const currentIndex = LIFECYCLE_STATUSES.indexOf(currentStatus)
    if (currentIndex < LIFECYCLE_STATUSES.length - 2) {
      const nextStatus = LIFECYCLE_STATUSES[currentIndex + 1]
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: nextStatus } : l))
      )
      await updateLeadStatusAPI(leadId, nextStatus)
    }
  }

  const getStatusBadgeClass = (status: LeadLifecycleStatus) => {
    switch (status) {
      case 'NEW':
        return 'bg-[#E9F1F5] text-[#142D4E]'
      case 'CONTACTED':
        return 'bg-[#FDF7EE] text-[#C58A36]'
      case 'QUALIFIED':
        return 'bg-[#E9F1F5] text-[#1D3D5C]'
      case 'QUOTE_REQUESTED':
        return 'bg-[#E8F5F2] text-[#16856D]'
      case 'QUOTE_SENT':
        return 'bg-[#16856D] text-white'
      case 'APPLICATION_IN_PROGRESS':
        return 'bg-[#142D4E] text-white'
      case 'CONVERTED':
        return 'bg-[#16856D] text-white font-bold'
      case 'LOST':
        return 'bg-[#FDF2F2] text-[#C44545]'
      default:
        return 'bg-[#E9F1F5] text-[#142D4E]'
    }
  }

  return (
    <div className="space-y-6 select-none" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8EF]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#16856D] bg-[#E8F5F2] px-2 py-0.5 rounded">
              Lead Management CRM
            </span>
            <span className="text-[11px] text-[#687788]">
              {leads.length} Total Prospects &bull; Pipeline Sum Assured: ₹
              {(leads.reduce((acc, cur) => acc + cur.desired_sum_assured, 0) / 10000000).toFixed(1)} Cr
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#142D4E] font-['Manrope'] mt-1">
            Centralised Lead Directory
          </h1>
          <p className="text-xs text-[#687788]">
            Manage prospective life insurance policyholders, automated advisor routing, and ML conversion scoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="inline-flex rounded-lg border border-[#E2E8EF] p-0.5 bg-white text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md flex items-center gap-1 font-semibold transition-colors ${
                viewMode === 'table' ? 'bg-[#142D4E] text-white' : 'text-[#687788] hover:text-[#182536]'
              }`}
              title="Table Grid View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md flex items-center gap-1 font-semibold transition-colors ${
                viewMode === 'kanban' ? 'bg-[#142D4E] text-white' : 'text-[#687788] hover:text-[#182536]'
              }`}
              title="Kanban Pipeline View"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pipeline</span>
            </button>
          </div>

          <button
            onClick={() => setCopilotOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#16856D] hover:bg-[#126b57] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Copilot</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Lead</span>
          </button>
        </div>
      </div>

      {/* Filter Ribbon & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8EF] shadow-xs space-y-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => {
              setStatusFilter('ALL')
              setCurrentPage(1)
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-[#142D4E] text-white'
                : 'text-[#687788] hover:bg-[#F7F9FB] hover:text-[#182536]'
            }`}
          >
            All Stages ({leads.length})
          </button>

          {LIFECYCLE_STATUSES.map((st) => {
            const count = leads.filter((l) => l.status === st).length
            return (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st)
                  setCurrentPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  statusFilter === st
                    ? 'bg-[#142D4E] text-white'
                    : 'text-[#687788] hover:bg-[#F7F9FB] hover:text-[#182536]'
                }`}
              >
                <span>{st.replace(/_/g, ' ')}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            )
          })}
        </div>

        {/* Search & Secondary Filter Dropdowns */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[#E2E8EF] text-xs">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-[#687788] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search by customer name, phone, lead ID, city..."
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-[#E2E8EF] bg-[#F7F9FB] focus:bg-white focus:border-[#142D4E] focus:outline-none transition-all text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Priority filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-[#E2E8EF] bg-[#F7F9FB] text-xs font-medium text-[#182536]"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High (ML 80+)</option>
              <option value="MEDIUM">Medium (ML 60-79)</option>
            </select>

            {/* Advisor filter */}
            <select
              value={advisorFilter}
              onChange={(e) => setAdvisorFilter(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-[#E2E8EF] bg-[#F7F9FB] text-xs font-medium text-[#182536]"
            >
              <option value="ALL">All Advisors</option>
              <option value="Rahul Sharma">Rahul Sharma</option>
              <option value="Priya Patel">Priya Patel</option>
              <option value="Unassigned">Unassigned</option>
            </select>

            {/* Source filter */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-[#E2E8EF] bg-[#F7F9FB] text-xs font-medium text-[#182536]"
            >
              <option value="ALL">All Sources</option>
              <option value="WEBSITE_ASSESSMENT">Assessment Calculator</option>
              <option value="WEBSITE_ENQUIRY">Website Direct</option>
              <option value="DIRECT">Direct Office Intake</option>
              <option value="REFERRAL">Referral / CA</option>
            </select>

            {/* Sorting */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-8 px-2.5 rounded-lg border border-[#E2E8EF] bg-[#F7F9FB] text-xs font-semibold text-[#142D4E]"
            >
              <option value="ml_score">Sort: Highest ML Score</option>
              <option value="sum_assured">Sort: Sum Assured</option>
              <option value="date">Sort: Most Recent</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW 1: DATA TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-[#E2E8EF] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F9FB] border-b border-[#E2E8EF] text-[#687788]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Lead ID & Customer</th>
                  <th className="py-3 px-4 font-semibold">Product Interest</th>
                  <th className="py-3 px-4 font-semibold">Target Cover</th>
                  <th className="py-3 px-4 font-semibold">ML Conversion Score</th>
                  <th className="py-3 px-4 font-semibold">Lifecycle Stage</th>
                  <th className="py-3 px-4 font-semibold">Assigned RM</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8EF]">
                {paginatedLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className="hover:bg-[#F7F9FB]/70 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <span className="font-bold text-[#182536] block text-xs">
                            {lead.customer_name}
                          </span>
                          <span className="text-[10px] text-[#687788] font-mono">
                            {lead.lead_number} &bull; {lead.customer_phone} &bull; {lead.customer_city || 'Mumbai'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#182536] block">{lead.product_interest}</span>
                      <span className="text-[10px] text-[#687788]">{lead.source.replace(/_/g, ' ')}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#142D4E]">
                        ₹{(lead.desired_sum_assured / 100000).toFixed(0)} Lakh
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16856D] bg-[#E8F5F2] px-2 py-0.5 rounded">
                        <Sparkles className="w-3 h-3" />
                        <span>{lead.current_ml_score} / 100</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${getStatusBadgeClass(
                          lead.status
                        )}`}
                      >
                        {lead.status.replace(/_/g, ' ')}
                      </span>
                      {lead.lost_reason && (
                        <span className="text-[9px] text-[#C44545] block truncate max-w-[140px]" title={lead.lost_reason}>
                          {lead.lost_reason}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[#182536] font-medium">
                          {lead.assigned_user_name || 'Unassigned'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setAssigningLead(lead)
                          }}
                          className="text-[10px] text-[#16856D] font-bold hover:underline"
                        >
                          Route
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedLeadId(lead.id)}
                          className="px-2 py-1 text-[11px] font-semibold rounded bg-[#142D4E] text-white hover:bg-[#1D3D5C]"
                        >
                          Dossier
                        </button>
                        {lead.status !== 'CONVERTED' && lead.status !== 'LOST' && (
                          <button
                            onClick={() => handleAdvanceStatus(lead.id, lead.status)}
                            className="px-2 py-1 text-[11px] font-semibold rounded border border-[#E2E8EF] hover:bg-[#E9F1F5] text-[#142D4E]"
                            title="Advance to next lifecycle stage"
                          >
                            Advance &rarr;
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-4 py-3 bg-[#F7F9FB] border-t border-[#E2E8EF] flex items-center justify-between text-xs text-[#687788]">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredLeads.length)} of {filteredLeads.length} leads
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded border border-[#E2E8EF] bg-white text-[#142D4E] disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-semibold text-[#142D4E]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded border border-[#E2E8EF] bg-white text-[#142D4E] disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: KANBAN PIPELINE VIEW */}
      {viewMode === 'kanban' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex items-start gap-3 min-w-max">
            {LIFECYCLE_STATUSES.map((st) => {
              const stageLeads = leads.filter((l) => l.status === st)
              const stageTotalSA = stageLeads.reduce((acc, cur) => acc + cur.desired_sum_assured, 0)

              return (
                <div
                  key={st}
                  className="w-72 bg-[#F7F9FB] border border-[#E2E8EF] rounded-xl flex flex-col max-h-[75vh]"
                >
                  {/* Column Header */}
                  <div className="p-3 border-b border-[#E2E8EF] flex items-center justify-between bg-white rounded-t-xl">
                    <div>
                      <span className="text-xs font-bold text-[#142D4E] font-['Manrope'] block">
                        {st.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-[#687788]">
                        ₹{(stageTotalSA / 100000).toFixed(0)} Lakh ({stageLeads.length})
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#142D4E] bg-[#E9F1F5] px-2 py-0.5 rounded-full">
                      {stageLeads.length}
                    </span>
                  </div>

                  {/* Cards Container */}
                  <div className="p-2.5 overflow-y-auto space-y-2.5 flex-1 scrollbar-thin">
                    {stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLeadId(lead.id)}
                        className="p-3 bg-white rounded-xl border border-[#E2E8EF] shadow-xs hover:border-[#142D4E] transition-all cursor-pointer space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono text-[10px] text-[#687788]">{lead.lead_number}</span>
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#16856D] bg-[#E8F5F2] px-1.5 py-0.2 rounded">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>{lead.current_ml_score}</span>
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-[#182536]">{lead.customer_name}</h4>
                          <p className="text-[11px] text-[#687788] line-clamp-1">{lead.product_interest}</p>
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#E2E8EF]">
                          <span className="font-bold text-[#142D4E]">
                            ₹{(lead.desired_sum_assured / 100000).toFixed(0)} L
                          </span>
                          <span className="text-[10px] text-[#687788]">
                            {lead.assigned_user_name?.split(' ')[0] || 'Unassigned'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Slide-over Lead Detail Drawer */}
      {selectedLeadId && (
        <LeadDetailDrawer
          isOpen={Boolean(selectedLeadId)}
          onClose={() => setSelectedLeadId(null)}
          leadId={selectedLeadId}
          onStatusUpdated={() => loadLeads()}
        />
      )}

      {/* Assignment Modal */}
      {assigningLead && (
        <LeadAssignmentModal
          isOpen={Boolean(assigningLead)}
          onClose={() => setAssigningLead(null)}
          leadId={assigningLead.id}
          leadNumber={assigningLead.lead_number}
          customerName={assigningLead.customer_name || 'Prospect'}
          productInterest={assigningLead.product_interest}
          sumAssured={assigningLead.desired_sum_assured}
          customerCity={assigningLead.customer_city}
          currentAssigneeName={assigningLead.assigned_user_name}
          onAssigned={(newAssignee) => {
            setLeads((prev) =>
              prev.map((l) => (l.id === assigningLead.id ? { ...l, assigned_user_name: newAssignee } : l))
            )
            setAssigningLead(null)
          }}
        />
      )}

      {/* Copilot Drawer */}
      <SalesCopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        initialAction="CUSTOMER_SUMMARY"
      />

      {/* Add New Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E2E8EF] max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8EF]">
              <h3 className="text-base font-bold text-[#142D4E] font-['Manrope']">
                Record New Prospect Intake
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#687788] hover:text-[#182536] text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#182536] mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Alok Aggarwal"
                  className="w-full h-8 px-3 rounded-lg border border-[#E2E8EF] bg-white focus:outline-none focus:border-[#142D4E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#182536] mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="+91 98xxx xxxxx"
                    className="w-full h-8 px-3 rounded-lg border border-[#E2E8EF] bg-white focus:outline-none focus:border-[#142D4E]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#182536] mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full h-8 px-3 rounded-lg border border-[#E2E8EF] bg-white focus:outline-none focus:border-[#142D4E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#182536] mb-1">City</label>
                  <input
                    type="text"
                    value={newCustCity}
                    onChange={(e) => setNewCustCity(e.target.value)}
                    className="w-full h-8 px-3 rounded-lg border border-[#E2E8EF] bg-white focus:outline-none focus:border-[#142D4E]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#182536] mb-1">Lead Source</label>
                  <select
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="w-full h-8 px-2 rounded-lg border border-[#E2E8EF] bg-white text-xs"
                  >
                    <option value="DIRECT">Direct Inbound</option>
                    <option value="WEBSITE_ASSESSMENT">Assessment Form</option>
                    <option value="WEBSITE_ENQUIRY">Website Callback</option>
                    <option value="REFERRAL">Referral / CA</option>
                    <option value="PARTNER">Corporate Tie-up</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#182536] mb-1">Target Product & Carrier</label>
                <select
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                  className="w-full h-8 px-2 rounded-lg border border-[#E2E8EF] bg-white text-xs"
                >
                  <option value="Click 2 Protect Super (HDFC Life)">Click 2 Protect Super (HDFC Life)</option>
                  <option value="iProtect Smart (ICICI Prudential)">iProtect Smart (ICICI Prudential)</option>
                  <option value="Smart Secure Plus (Max Life)">Smart Secure Plus (Max Life)</option>
                  <option value="eShield Next (SBI Life)">eShield Next (SBI Life)</option>
                  <option value="Tech Term (LIC of India)">Tech Term (LIC of India)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#182536] mb-1">Estimated Sum Assured</label>
                <select
                  value={newSumAssured}
                  onChange={(e) => setNewSumAssured(Number(e.target.value))}
                  className="w-full h-8 px-2 rounded-lg border border-[#E2E8EF] bg-white text-xs"
                >
                  <option value={5000000}>₹50 Lakh</option>
                  <option value={7500000}>₹75 Lakh</option>
                  <option value={10000000}>₹1.0 Crore</option>
                  <option value={15000000}>₹1.5 Crore</option>
                  <option value={20000000}>₹2.0 Crore</option>
                  <option value={50000000}>₹5.0 Crore (HNW Keyman)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#E2E8EF] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#E2E8EF] text-[#687788] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white text-xs font-semibold shadow-xs"
                >
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
