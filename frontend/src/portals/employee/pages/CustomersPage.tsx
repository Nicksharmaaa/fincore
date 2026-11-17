import React, { useState, useEffect, useMemo } from 'react'
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileText,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react'
import {
  fetchCustomersAPI,
  type CRMCustomer,
} from '../../../services/api'
import { Customer360Drawer } from '../components/Customer360Drawer'
import { SalesCopilotDrawer } from '../components/SalesCopilotDrawer'

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CRMCustomer[]>([])
  const [loading, setLoading] = useState(true)

  // Search & Filter
  const [search, setSearch] = useState('')
  const [kycFilter, setKycFilter] = useState('ALL')
  const [segmentFilter, setSegmentFilter] = useState('ALL')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Drawers / modals
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [selectedCustomerObj, setSelectedCustomerObj] = useState<CRMCustomer | undefined>(undefined)
  const [copilotOpen, setCopilotOpen] = useState(false)

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    setLoading(true)
    try {
      const data = await fetchCustomersAPI()
      setCustomers(data)
    } catch (err) {
      console.error('Failed to load customers', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    let result = [...customers]
    if (kycFilter !== 'ALL') {
      result = result.filter((c) => c.kyc_status === kycFilter)
    }
    if (segmentFilter !== 'ALL') {
      result = result.filter((c) => c.segment.toLowerCase().includes(segmentFilter.toLowerCase()))
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(
        (c) =>
          c.full_name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.city.toLowerCase().includes(q) ||
          (c.pan_number && c.pan_number.toLowerCase().includes(q))
      )
    }
    return result
  }, [customers, kycFilter, segmentFilter, search])

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage])

  const handleOpen360 = (c: CRMCustomer) => {
    setSelectedCustomerId(c.id)
    setSelectedCustomerObj(c)
  }

  return (
    <div className="space-y-6 select-none" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8EF]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#16856D] bg-[#E8F5F2] px-2 py-0.5 rounded">
              Customer 360° Repository
            </span>
            <span className="text-[11px] text-[#687788]">
              {customers.length} Registered Life Policyholders
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#142D4E] font-['Manrope'] mt-1">
            Customer Profiles & Relationship Hub
          </h1>
          <p className="text-xs text-[#687788]">
            Unified pane of glass for verified KYC, multi-insurer held policies, and complete relationship timeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCopilotOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#16856D] hover:bg-[#126b57] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Client AI Assistant</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8EF] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#687788] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Search by name, phone, PAN, city..."
            className="w-full h-8 pl-8 pr-3 rounded-lg border border-[#E2E8EF] bg-[#F7F9FB] focus:bg-white focus:border-[#142D4E] focus:outline-none transition-all text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={kycFilter}
            onChange={(e) => {
              setKycFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="h-8 px-2.5 rounded-lg border border-[#E2E8EF] bg-[#F7F9FB] text-xs font-medium text-[#182536]"
          >
            <option value="ALL">All KYC Statuses</option>
            <option value="Verified">KYC Verified</option>
            <option value="Pending">KYC Pending</option>
          </select>

          <select
            value={segmentFilter}
            onChange={(e) => {
              setSegmentFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="h-8 px-2.5 rounded-lg border border-[#E2E8EF] bg-[#F7F9FB] text-xs font-medium text-[#182536]"
          >
            <option value="ALL">All Segments</option>
            <option value="Affluent">Affluent / HNW</option>
            <option value="Salaried">Salaried Retail</option>
            <option value="Business">Business Owner</option>
          </select>

          <span className="text-xs text-[#687788] pl-2 border-l border-[#E2E8EF]">
            Showing <strong>{filtered.length}</strong> clients
          </span>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-xl border border-[#E2E8EF] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9FB] border-b border-[#E2E8EF] text-[#687788]">
              <tr>
                <th className="py-3 px-4 font-semibold">Client Name & ID</th>
                <th className="py-3 px-4 font-semibold">Contact & Location</th>
                <th className="py-3 px-4 font-semibold">Masked PAN</th>
                <th className="py-3 px-4 font-semibold">KYC Verification</th>
                <th className="py-3 px-4 font-semibold">Wealth Segment</th>
                <th className="py-3 px-4 font-semibold">Policies In-Force</th>
                <th className="py-3 px-4 font-semibold">Total Protection Cover</th>
                <th className="py-3 px-4 font-semibold text-right">360° Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8EF]">
              {paginated.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => handleOpen360(c)}
                  className="hover:bg-[#F7F9FB]/70 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[#182536] block">{c.full_name}</span>
                    <span className="text-[10px] text-[#687788] font-mono">{c.id}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="text-[#182536] block font-medium">{c.phone}</span>
                    <span className="text-[10px] text-[#687788]">{c.city} &bull; {c.email}</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-[#142D4E]">
                    {c.pan_number || 'ABCDE1234F'}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded inline-flex items-center gap-1 ${
                        c.kyc_status === 'Verified'
                          ? 'bg-[#E8F5F2] text-[#16856D]'
                          : 'bg-[#FDF7EE] text-[#C58A36]'
                      }`}
                    >
                      {c.kyc_status === 'Verified' && <CheckCircle2 className="w-3 h-3" />}
                      <span>{c.kyc_status}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-semibold text-[#142D4E] bg-[#E9F1F5] px-2 py-0.5 rounded">
                      {c.segment}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-[#182536]">
                    {c.total_policies || 1} {c.total_policies === 1 ? 'Policy' : 'Policies'}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-[#16856D]">
                    {c.total_sum_assured || '₹2.0 Crore'}
                  </td>

                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleOpen360(c)}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded bg-[#142D4E] text-white hover:bg-[#1D3D5C] shadow-xs"
                    >
                      View 360°
                    </button>
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
            {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} clients
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

      {/* Customer 360 Drawer */}
      {selectedCustomerId && (
        <Customer360Drawer
          isOpen={Boolean(selectedCustomerId)}
          onClose={() => {
            setSelectedCustomerId(null)
            setSelectedCustomerObj(undefined)
          }}
          customerId={selectedCustomerId}
          initialCustomer={selectedCustomerObj}
        />
      )}

      {/* Copilot Drawer */}
      <SalesCopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        initialAction="CUSTOMER_SUMMARY"
      />
    </div>
  )
}
