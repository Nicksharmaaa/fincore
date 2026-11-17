import React, { useState, useEffect } from 'react'
import {
  Users,
  ShieldCheck,
  Building2,
  PackageCheck,
  FileText,
  History,
  Sliders,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  RefreshCw,
  Lock,
  Bell,
  Mail,
  Phone,
  ArrowUpRight,
  ChevronRight,
  Filter,
} from 'lucide-react'

const IS_DEMO = true

const formatINR = (amount: number): string => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} Lakh`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return `₹${amount.toLocaleString('en-IN')}`
}

const DemoBadge = () =>
  IS_DEMO ? (
    <span className="text-[10px] font-bold text-[#C58A36] bg-[#FDF7EE] border border-[#C58A36]/20 px-1.5 py-0.5 rounded">
      DEMO DATA
    </span>
  ) : null

// ---------------------------------------------------------------------------
// Seed Data & Types
// ---------------------------------------------------------------------------

interface UserItem {
  id: string
  fullName: string
  email: string
  phone: string
  role: 'admin' | 'manager' | 'sales' | 'operations' | 'finance' | 'compliance'
  department: string
  branch: string
  isActive: boolean
  lastLogin: string
}

const SEED_USERS: UserItem[] = [
  { id: 'USR-001', fullName: 'Vikramaditya Singhania', email: 'admin@fincore.in', phone: '+91 98200 11001', role: 'admin', department: 'Executive Management', branch: 'Mumbai HQ', isActive: true, lastLogin: '17-Nov-2026 09:30' },
  { id: 'USR-002', fullName: 'Anita Desai', email: 'anita.desai@fincore.in', phone: '+91 98200 11002', role: 'manager', department: 'Agency Sales', branch: 'Mumbai HQ', isActive: true, lastLogin: '17-Nov-2026 09:15' },
  { id: 'USR-003', fullName: 'Arjun Kapoor', email: 'sales@fincore.in', phone: '+91 98200 11003', role: 'sales', department: 'Direct Advisory', branch: 'Mumbai Nariman Point', isActive: true, lastLogin: '17-Nov-2026 10:05' },
  { id: 'USR-004', fullName: 'Neha Verma', email: 'neha.verma@fincore.in', phone: '+91 98200 11004', role: 'sales', department: 'Direct Advisory', branch: 'Delhi Connaught Place', isActive: true, lastLogin: '17-Nov-2026 08:45' },
  { id: 'USR-005', fullName: 'Rajesh Kumar', email: 'rajesh.kumar@fincore.in', phone: '+91 98200 11005', role: 'sales', department: 'Direct Advisory', branch: 'Bengaluru Indiranagar', isActive: true, lastLogin: '16-Nov-2026 17:20' },
  { id: 'USR-006', fullName: 'Priya Sharma', email: 'ops@fincore.in', phone: '+91 98200 11006', role: 'operations', department: 'Underwriting Ops', branch: 'Mumbai HQ', isActive: true, lastLogin: '17-Nov-2026 09:40' },
  { id: 'USR-007', fullName: 'Suresh Menon', email: 'finance@fincore.in', phone: '+91 98200 11007', role: 'finance', department: 'Brokerage Accounts', branch: 'Mumbai HQ', isActive: true, lastLogin: '16-Nov-2026 18:00' },
  { id: 'USR-008', fullName: 'Meena Nair', email: 'compliance@fincore.in', phone: '+91 98200 11008', role: 'compliance', department: 'Legal & IRDAI Liaison', branch: 'Mumbai HQ', isActive: true, lastLogin: '17-Nov-2026 09:10' },
]

interface InsurerAdminItem {
  id: string
  name: string
  code: string
  irdaiReg: string
  category: string
  productsCount: number
  apiEndpoint: string
  status: 'Connected' | 'Degraded' | 'Offline'
  commissionModel: string
  lastSync: string
}

const SEED_INSURERS: InsurerAdminItem[] = [
  { id: 'INS-01', name: 'HDFC Life Insurance Co.', code: 'HDFCLIFE', irdaiReg: '101', category: 'Private Life Insurer', productsCount: 6, apiEndpoint: 'https://api.hdfclife.com/broker-gateway/v2', status: 'Connected', commissionModel: 'IRDAI Slabs (2023 Regs)', lastSync: '10 mins ago' },
  { id: 'INS-02', name: 'ICICI Prudential Life Insurance', code: 'ICICIPRU', irdaiReg: '105', category: 'Private Life Insurer', productsCount: 5, apiEndpoint: 'https://partners.iciciprulife.com/api/v3', status: 'Connected', commissionModel: 'IRDAI Slabs (2023 Regs)', lastSync: '15 mins ago' },
  { id: 'INS-03', name: 'Max Life Insurance Co.', code: 'MAXLIFE', irdaiReg: '104', category: 'Private Life Insurer', productsCount: 4, apiEndpoint: 'https://b2b.maxlifeinsurance.com/v1', status: 'Connected', commissionModel: 'IRDAI Slabs (2023 Regs)', lastSync: '22 mins ago' },
  { id: 'INS-04', name: 'SBI Life Insurance Co.', code: 'SBILIFE', irdaiReg: '111', category: 'Bank-promoted Life Insurer', productsCount: 4, apiEndpoint: 'https://apim.sbilife.co.in/brokerage', status: 'Connected', commissionModel: 'IRDAI Slabs (2023 Regs)', lastSync: '30 mins ago' },
  { id: 'INS-05', name: 'Life Insurance Corporation of India', code: 'LICINDIA', irdaiReg: '512', category: 'Public Sector Life Insurer', productsCount: 3, apiEndpoint: 'https://portal.licindia.in/agency-rest/v1', status: 'Connected', commissionModel: 'Standard Statutory Slabs', lastSync: '1 hour ago' },
  { id: 'INS-06', name: 'Tata AIA Life Insurance', code: 'TATAAIA', irdaiReg: '110', category: 'Private Life Insurer', productsCount: 3, apiEndpoint: 'https://services.tataaia.com/broker/v2', status: 'Connected', commissionModel: 'IRDAI Slabs (2023 Regs)', lastSync: '45 mins ago' },
]

interface ProductAdminItem {
  id: string
  name: string
  uin: string
  insurer: string
  category: string
  version: string
  isActive: boolean
  minSumAssured: number
  maxSumAssured: number
}

const SEED_PRODUCTS: ProductAdminItem[] = [
  { id: 'PRD-001', name: 'Click 2 Protect Super', uin: '101N145V04', insurer: 'HDFC Life', category: 'Term Plan', version: '4.2', isActive: true, minSumAssured: 5000000, maxSumAssured: 100000000 },
  { id: 'PRD-002', name: 'iProtect Smart', uin: '105N151V03', insurer: 'ICICI Prudential', category: 'Term Plan', version: '3.8', isActive: true, minSumAssured: 5000000, maxSumAssured: 100000000 },
  { id: 'PRD-003', name: 'Smart Wealth Goal', uin: '104L117V02', insurer: 'Max Life', category: 'ULIP', version: '2.1', isActive: true, minSumAssured: 2500000, maxSumAssured: 50000000 },
  { id: 'PRD-004', name: 'eShield Next', uin: '111N128V02', insurer: 'SBI Life', category: 'Term Plan', version: '2.0', isActive: true, minSumAssured: 5000000, maxSumAssured: 100000000 },
  { id: 'PRD-005', name: 'Tech Term Plan 854', uin: '512N333V01', insurer: 'LIC of India', category: 'Term Plan', version: '1.4', isActive: true, minSumAssured: 5000000, maxSumAssured: 200000000 },
  { id: 'PRD-006', name: 'Sampoorna Raksha Supreme', uin: '110N154V03', insurer: 'Tata AIA Life', category: 'Term Plan', version: '3.0', isActive: true, minSumAssured: 5000000, maxSumAssured: 100000000 },
]

interface AuditLogItem {
  id: string
  timestamp: string
  actorEmail: string
  action: string
  entityName: string
  entityId: string
  changes: string
}

const SEED_AUDIT_LOGS: AuditLogItem[] = [
  { id: 'AUD-991', timestamp: '17-Nov-2026 14:12:44', actorEmail: 'admin@fincore.in', action: 'UPDATE_COMMISSION_SCHEDULE', entityName: 'CommissionSchedule', entityId: 'CS-801', changes: '{"rate": 18.5, "cap": 20.0}' },
  { id: 'AUD-990', timestamp: '17-Nov-2026 13:45:10', actorEmail: 'anita.desai@fincore.in', action: 'REASSIGN_LEAD', entityName: 'Lead', entityId: 'LD-1044', changes: '{"from": "Arjun Kapoor", "to": "Neha Verma", "reason": "Workload rebalance"}' },
  { id: 'AUD-989', timestamp: '17-Nov-2026 12:20:05', actorEmail: 'ops@fincore.in', action: 'VERIFY_CARRIER_SUBMISSION', entityName: 'Application', entityId: 'APP-9022', changes: '{"carrier_ref": "HDFC-PR-2026-90412", "status": "Submitted to Insurer"}' },
  { id: 'AUD-988', timestamp: '17-Nov-2026 11:05:32', actorEmail: 'admin@fincore.in', action: 'CREATE_USER', entityName: 'User', entityId: 'USR-009', changes: '{"email": "sumit.sen@fincore.in", "role": "sales"}' },
  { id: 'AUD-987', timestamp: '17-Nov-2026 09:30:18', actorEmail: 'system@fincore.in', action: 'AUTO_ASSIGN_LEAD', entityName: 'Lead', entityId: 'LD-1052', changes: '{"algorithm": "multi_criteria_scoring", "score": 88, "assigned_to": "Arjun Kapoor"}' },
]

interface CommissionScheduleItem {
  id: string
  insurer: string
  category: string
  firstYearRatePct: number
  renewalRatePct: number
  irdaiCapRatePct: number
  effectiveFrom: string
  isActive: boolean
}

const SEED_COMMISSION_SCHEDULES: CommissionScheduleItem[] = [
  { id: 'CS-801', insurer: 'HDFC Life', category: 'Term Insurance', firstYearRatePct: 18.0, renewalRatePct: 5.0, irdaiCapRatePct: 20.0, effectiveFrom: '01-Apr-2026', isActive: true },
  { id: 'CS-802', insurer: 'ICICI Prudential', category: 'Term Insurance', firstYearRatePct: 17.5, renewalRatePct: 5.0, irdaiCapRatePct: 20.0, effectiveFrom: '01-Apr-2026', isActive: true },
  { id: 'CS-803', insurer: 'Max Life', category: 'ULIPs', firstYearRatePct: 7.5, renewalRatePct: 2.5, irdaiCapRatePct: 10.0, effectiveFrom: '01-Apr-2026', isActive: true },
  { id: 'CS-804', insurer: 'SBI Life', category: 'Term Insurance', firstYearRatePct: 16.0, renewalRatePct: 4.5, irdaiCapRatePct: 20.0, effectiveFrom: '01-Apr-2026', isActive: true },
  { id: 'CS-805', insurer: 'LIC of India', category: 'Whole Life / Traditional', firstYearRatePct: 20.0, renewalRatePct: 6.0, irdaiCapRatePct: 20.0, effectiveFrom: '01-Apr-2026', isActive: true },
]

type AdminTab = 'users' | 'roles' | 'insurers' | 'products' | 'commissions' | 'workflows' | 'audit'

export const AdminPanelPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('users')

  // Users state
  const [users, setUsers] = useState<UserItem[]>(SEED_USERS)
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('ALL')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPhone, setNewUserPhone] = useState('')
  const [newUserRole, setNewUserRole] = useState<'sales' | 'manager' | 'operations' | 'finance' | 'compliance'>('sales')
  const [newUserDept, setNewUserDept] = useState('Direct Advisory')
  const [newUserBranch, setNewUserBranch] = useState('Mumbai HQ')

  // Commission Schedules state
  const [schedules, setSchedules] = useState<CommissionScheduleItem[]>(SEED_COMMISSION_SCHEDULES)
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false)
  const [newSchedInsurer, setNewSchedInsurer] = useState('HDFC Life')
  const [newSchedCategory, setNewSchedCategory] = useState('Term Insurance')
  const [newSchedRate, setNewSchedRate] = useState(18.0)
  const [newSchedRenewal, setNewSchedRenewal] = useState(5.0)
  const [newSchedCap, setNewSchedCap] = useState(20.0)

  // Workflows & Assignment settings
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(true)
  const [workloadWeight, setWorkloadWeight] = useState(30)
  const [specializationWeight, setSpecializationWeight] = useState(30)
  const [geoWeight, setGeoWeight] = useState(20)
  const [languageWeight, setLanguageWeight] = useState(20)
  const [firstFollowupHours, setFirstFollowupHours] = useState(24)
  const [overdueEscalationHours, setOverdueEscalationHours] = useState(72)
  const [notificationEmail, setNotificationEmail] = useState(true)
  const [notificationWhatsApp, setNotificationWhatsApp] = useState(true)
  const [configSavedToast, setConfigSavedToast] = useState(false)

  // Audit search
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(SEED_AUDIT_LOGS)
  const [auditSearch, setAuditSearch] = useState('')
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLogItem | null>(null)

  // Fetch live users and audit logs if backend available
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    fetch('/api/v1/users/', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: UserItem[] = data.map((u: any) => ({
            id: u.id || `USR-${Math.floor(Math.random() * 900 + 100)}`,
            fullName: u.full_name || u.email,
            email: u.email,
            phone: u.phone || '+91 98200 11000',
            role: (u.roles && u.roles[0]?.code) || 'sales',
            department: 'Insurance Brokerage',
            branch: 'Mumbai HQ',
            isActive: u.is_active ?? true,
            lastLogin: 'Active Today',
          }))
          setUsers(mapped)
        }
      })
      .catch(() => {})

    fetch('/api/v1/admin/audit-logs?limit=20', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: AuditLogItem[] = data.map((l: any) => ({
            id: l.id?.slice(0, 8) || `AUD-${Math.floor(Math.random() * 900 + 100)}`,
            timestamp: l.created_at ? new Date(l.created_at).toLocaleString('en-IN') : 'Just now',
            actorEmail: l.actor_email || 'admin@fincore.in',
            action: l.action || 'TRANSACTION',
            entityName: l.entity_name || 'System',
            entityId: l.entity_id || 'N/A',
            changes: JSON.stringify(l.changes_json || {}),
          }))
          setAuditLogs(mapped)
        }
      })
      .catch(() => {})
  }, [])

  // User Actions
  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u))
    )
  }

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserEmail || !newUserName) return

    const newUser: UserItem = {
      id: `USR-${Math.floor(Math.random() * 900 + 100)}`,
      fullName: newUserName,
      email: newUserEmail,
      phone: newUserPhone || '+91 98200 00000',
      role: newUserRole,
      department: newUserDept,
      branch: newUserBranch,
      isActive: true,
      lastLogin: 'Pending Invitation',
    }
    setUsers([newUser, ...users])
    setShowInviteModal(false)
    setNewUserName('')
    setNewUserEmail('')
    setNewUserPhone('')
  }

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault()
    if (newSchedRate > newSchedCap) {
      alert(`First year rate cannot exceed IRDAI cap of ${newSchedCap}%`)
      return
    }

    const newSched: CommissionScheduleItem = {
      id: `CS-${Math.floor(Math.random() * 900 + 100)}`,
      insurer: newSchedInsurer,
      category: newSchedCategory,
      firstYearRatePct: newSchedRate,
      renewalRatePct: newSchedRenewal,
      irdaiCapRatePct: newSchedCap,
      effectiveFrom: '17-Nov-2026',
      isActive: true,
    }
    setSchedules([newSched, ...schedules])
    setShowAddScheduleModal(false)
  }

  const handleSaveWorkflowConfig = (e: React.FormEvent) => {
    e.preventDefault()
    const totalWeight = workloadWeight + specializationWeight + geoWeight + languageWeight
    if (totalWeight !== 100) {
      alert(`Assignment algorithm weights must sum to exactly 100%. Current sum: ${totalWeight}%`)
      return
    }
    setConfigSavedToast(true)
    setTimeout(() => setConfigSavedToast(false), 3000)
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.id.toLowerCase().includes(userSearch.toLowerCase())
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter.toLowerCase()
    return matchesSearch && matchesRole
  })

  const filteredAuditLogs = auditLogs.filter((l) => {
    return (
      l.actorEmail.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.entityName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.entityId.toLowerCase().includes(auditSearch.toLowerCase())
    )
  })

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8EF]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#16856D]">
              Platform Administration & Governance
            </span>
            <DemoBadge />
          </div>
          <h1 className="text-2xl font-bold text-[#142D4E] font-['Manrope'] mt-0.5">
            Brokerage Administration & System Control
          </h1>
          <p className="text-xs text-[#687788]">
            Configure roles, employees, authorized partner insurers, product registries, IRDAI commission slabs, and audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#142D4E] text-white">
            <Lock className="w-3.5 h-3.5" />
            <span>Admin & Management Mode</span>
          </span>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-[#E2E8EF] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#687788] block">Total Users</span>
          <span className="text-xl font-bold text-[#142D4E] font-['Manrope'] mt-1 block">{users.length}</span>
          <span className="text-[10px] text-[#16856D] font-medium">8 active seats</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-[#E2E8EF] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#687788] block">Partner Insurers</span>
          <span className="text-xl font-bold text-[#142D4E] font-['Manrope'] mt-1 block">{SEED_INSURERS.length}</span>
          <span className="text-[10px] text-[#16856D] font-medium">100% API online</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-[#E2E8EF] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#687788] block">Active Products</span>
          <span className="text-xl font-bold text-[#142D4E] font-['Manrope'] mt-1 block">{SEED_PRODUCTS.length}</span>
          <span className="text-[10px] text-[#687788]">Across 6 carriers</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-[#E2E8EF] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#687788] block">Commission Slabs</span>
          <span className="text-xl font-bold text-[#142D4E] font-['Manrope'] mt-1 block">{schedules.length}</span>
          <span className="text-[10px] text-[#16856D] font-medium">IRDAI 2023 Compliant</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-[#E2E8EF] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#687788] block">Assignment Engine</span>
          <span className="text-xl font-bold text-[#16856D] font-['Manrope'] mt-1 block">Active</span>
          <span className="text-[10px] text-[#687788]">Weighted 4-factor</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-[#E2E8EF] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#687788] block">Audit Log Entries</span>
          <span className="text-xl font-bold text-[#142D4E] font-['Manrope'] mt-1 block">{auditLogs.length}</span>
          <span className="text-[10px] text-[#687788]">Immutable append</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-[#E2E8EF] flex items-center gap-1 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-[#142D4E] text-[#142D4E] font-bold'
              : 'border-transparent text-[#687788] hover:text-[#182536]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User & Employee Directory</span>
          <span className="ml-1 px-1.5 py-0.2 bg-[#E9F1F5] text-[#142D4E] rounded-full text-[10px] font-bold">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'roles'
              ? 'border-[#142D4E] text-[#142D4E] font-bold'
              : 'border-transparent text-[#687788] hover:text-[#182536]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Role & Permission Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('insurers')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'insurers'
              ? 'border-[#142D4E] text-[#142D4E] font-bold'
              : 'border-transparent text-[#687788] hover:text-[#182536]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Partner Insurers</span>
          <span className="ml-1 px-1.5 py-0.2 bg-[#E9F1F5] text-[#142D4E] rounded-full text-[10px] font-bold">
            {SEED_INSURERS.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-[#142D4E] text-[#142D4E] font-bold'
              : 'border-transparent text-[#687788] hover:text-[#182536]'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>Product Catalogue</span>
          <span className="ml-1 px-1.5 py-0.2 bg-[#E9F1F5] text-[#142D4E] rounded-full text-[10px] font-bold">
            {SEED_PRODUCTS.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('commissions')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'commissions'
              ? 'border-[#142D4E] text-[#142D4E] font-bold'
              : 'border-transparent text-[#687788] hover:text-[#182536]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Commission Schedules & Accruals</span>
        </button>

        <button
          onClick={() => setActiveTab('workflows')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'workflows'
              ? 'border-[#142D4E] text-[#142D4E] font-bold'
              : 'border-transparent text-[#687788] hover:text-[#182536]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Workflows & Assignment</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-[#142D4E] text-[#142D4E] font-bold'
              : 'border-transparent text-[#687788] hover:text-[#182536]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Log Trail</span>
        </button>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* TAB 1: USER & EMPLOYEE MANAGEMENT                                     */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#687788] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user by name, email or ID..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E2E8EF] rounded-lg focus:outline-none focus:border-[#142D4E]"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="text-xs bg-white border border-[#E2E8EF] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#142D4E]"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="SALES">Sales Advisor</option>
                <option value="OPERATIONS">Operations</option>
                <option value="FINANCE">Finance</option>
                <option value="COMPLIANCE">Compliance</option>
              </select>
            </div>

            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white text-xs font-semibold shadow-xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Invite New Employee</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8EF] shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F9FB] border-b border-[#E2E8EF] text-[#687788]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">User ID</th>
                  <th className="py-2.5 px-3 font-semibold">Full Name & Contact</th>
                  <th className="py-2.5 px-3 font-semibold">Role & Access</th>
                  <th className="py-2.5 px-3 font-semibold">Department</th>
                  <th className="py-2.5 px-3 font-semibold">Branch Office</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Last Session</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8EF]">
                {filteredUsers.map((u) => {
                  const roleBadgeClass =
                    u.role === 'admin'
                      ? 'bg-[#142D4E] text-white'
                      : u.role === 'manager'
                      ? 'bg-[#1D3D5C] text-white'
                      : u.role === 'sales'
                      ? 'bg-[#E8F5F2] text-[#16856D] font-bold'
                      : u.role === 'finance'
                      ? 'bg-[#FDF7EE] text-[#C58A36] font-bold'
                      : 'bg-[#E9F1F5] text-[#142D4E] font-medium'

                  return (
                    <tr key={u.id} className="hover:bg-[#F7F9FB]/60 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#142D4E]">{u.id}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-[#182536] block">{u.fullName}</span>
                        <span className="text-[11px] text-[#687788]">{u.email}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${roleBadgeClass}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#182536]">{u.department}</td>
                      <td className="py-2.5 px-3 text-[#687788]">{u.branch}</td>
                      <td className="py-2.5 px-3">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16856D]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#16856D]" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C44545]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C44545]" /> Suspended
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-[#687788]">{u.lastLogin}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-colors ${
                            u.isActive
                              ? 'text-[#C44545] hover:bg-[#FDF2F2]'
                              : 'text-[#16856D] hover:bg-[#E8F5F2]'
                          }`}
                        >
                          {u.isActive ? 'Suspend' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 2: ROLES & PERMISSIONS MATRIX                                     */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#E9F1F5] border border-[#142D4E]/10 flex items-start gap-3 text-xs">
            <ShieldCheck className="w-4 h-4 text-[#142D4E] flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#142D4E] block">Role-Based Access Control (RBAC) Governance</span>
              <p className="text-[#687788] mt-0.5">
                Permissions are enforced at both API route-guard middleware and frontend navigation levels. Strict separation of customer data, commission figures, and management audits conform to IRDAI data governance mandates.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8EF] shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F9FB] border-b border-[#E2E8EF] text-[#687788]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Permission Capability</th>
                  <th className="py-3 px-3 font-semibold text-center">Admin</th>
                  <th className="py-3 px-3 font-semibold text-center">Manager</th>
                  <th className="py-3 px-3 font-semibold text-center">Sales Advisor</th>
                  <th className="py-3 px-3 font-semibold text-center">Operations</th>
                  <th className="py-3 px-3 font-semibold text-center">Finance</th>
                  <th className="py-3 px-3 font-semibold text-center">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8EF]">
                {[
                  { name: 'View & Manage Leads', admin: true, manager: true, sales: true, ops: true, finance: false, compliance: true },
                  { name: 'View Customer 360 & KYC', admin: true, manager: true, sales: true, ops: true, finance: false, compliance: true },
                  { name: 'Generate Quotations', admin: true, manager: true, sales: true, ops: true, finance: true, compliance: true },
                  { name: 'Carrier Submission & Policy Tracking', admin: true, manager: true, sales: true, ops: true, finance: true, compliance: true },
                  { name: 'Lead Assignment & Reallocation', admin: true, manager: true, sales: false, ops: false, finance: false, compliance: false },
                  { name: 'Executive BI & Funnel Analytics', admin: true, manager: true, sales: false, ops: false, finance: true, compliance: false },
                  { name: 'Commission Slabs & Accruals', admin: true, manager: true, sales: false, ops: false, finance: true, compliance: false },
                  { name: 'User & Employee Administration', admin: true, manager: false, sales: false, ops: false, finance: false, compliance: false },
                  { name: 'Partner Insurer Configuration', admin: true, manager: false, sales: false, ops: false, finance: false, compliance: false },
                  { name: 'Product Catalogue Updates', admin: true, manager: false, sales: false, ops: false, finance: false, compliance: false },
                  { name: 'View Immutable Audit Trails', admin: true, manager: true, sales: false, ops: false, finance: false, compliance: true },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F7F9FB]/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-[#182536]">{row.name}</td>
                    <td className="py-3 px-3 text-center">{row.admin ? <CheckCircle2 className="w-4 h-4 text-[#16856D] inline" /> : <XCircle className="w-4 h-4 text-[#E2E8EF] inline" />}</td>
                    <td className="py-3 px-3 text-center">{row.manager ? <CheckCircle2 className="w-4 h-4 text-[#16856D] inline" /> : <XCircle className="w-4 h-4 text-[#E2E8EF] inline" />}</td>
                    <td className="py-3 px-3 text-center">{row.sales ? <CheckCircle2 className="w-4 h-4 text-[#16856D] inline" /> : <XCircle className="w-4 h-4 text-[#E2E8EF] inline" />}</td>
                    <td className="py-3 px-3 text-center">{row.ops ? <CheckCircle2 className="w-4 h-4 text-[#16856D] inline" /> : <XCircle className="w-4 h-4 text-[#E2E8EF] inline" />}</td>
                    <td className="py-3 px-3 text-center">{row.finance ? <CheckCircle2 className="w-4 h-4 text-[#16856D] inline" /> : <XCircle className="w-4 h-4 text-[#E2E8EF] inline" />}</td>
                    <td className="py-3 px-3 text-center">{row.compliance ? <CheckCircle2 className="w-4 h-4 text-[#16856D] inline" /> : <XCircle className="w-4 h-4 text-[#E2E8EF] inline" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 3: PARTNER INSURERS MANAGEMENT                                    */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'insurers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#687788]">
              Authorized partner life insurers operating under authorized direct broker agreements.
            </span>
            <button
              onClick={() => alert('New Insurer Onboarding: Requires IRDAI registration verification and agency agreement execution.')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Partner Insurer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SEED_INSURERS.map((ins) => (
              <div key={ins.id} className="bg-white rounded-xl border border-[#E2E8EF] p-4 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#16856D] uppercase">IRDAI Reg: {ins.irdaiReg}</span>
                    <h3 className="text-sm font-bold text-[#142D4E] font-['Manrope'] mt-0.5">{ins.name}</h3>
                    <span className="text-[11px] text-[#687788]">{ins.category}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#E8F5F2] text-[#16856D]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16856D]" /> {ins.status}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#E2E8EF] space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#687788]">Active Products:</span>
                    <span className="font-semibold text-[#182536]">{ins.productsCount} catalogued</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#687788]">Commission Model:</span>
                    <span className="font-semibold text-[#182536]">{ins.commissionModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#687788]">Last Rate Card Sync:</span>
                    <span className="text-[#687788]">{ins.lastSync}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] text-[#687788] truncate max-w-[180px]">{ins.apiEndpoint}</span>
                  <button
                    onClick={() => alert(`Pinged ${ins.name} B2B Gateway — Status: 200 OK (Latency: 48ms)`)}
                    className="text-[11px] font-semibold text-[#142D4E] hover:underline"
                  >
                    Test Ping
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 4: PRODUCT CATALOGUE ADMINISTRATION                               */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#687788]">
              Product versioning, UIN tracking, and eligibility configuration across partner insurers.
            </span>
            <button
              onClick={() => alert('New Product Specification Form: Enter IRDAI UIN, version, and benefits schedule.')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Product Version</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8EF] shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F9FB] border-b border-[#E2E8EF] text-[#687788]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Product Name</th>
                  <th className="py-2.5 px-3 font-semibold">IRDAI UIN</th>
                  <th className="py-2.5 px-3 font-semibold">Carrier</th>
                  <th className="py-2.5 px-3 font-semibold">Category</th>
                  <th className="py-2.5 px-3 font-semibold">Version</th>
                  <th className="py-2.5 px-3 font-semibold">Sum Assured Range</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8EF]">
                {SEED_PRODUCTS.map((prd) => (
                  <tr key={prd.id} className="hover:bg-[#F7F9FB]/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-[#142D4E]">{prd.name}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#687788]">{prd.uin}</td>
                    <td className="py-2.5 px-3 text-[#182536]">{prd.insurer}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E9F1F5] text-[#142D4E]">
                        {prd.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">v{prd.version}</td>
                    <td className="py-2.5 px-3 text-[#182536]">
                      {formatINR(prd.minSumAssured)} – {formatINR(prd.maxSumAssured)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16856D]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16856D]" /> Active
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => alert(`Viewing version history for ${prd.name} (${prd.uin})`)}
                        className="text-[11px] font-semibold text-[#142D4E] hover:underline"
                      >
                        Version History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 5: COMMISSION SCHEDULES & ACCRUALS                                */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'commissions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#142D4E] font-['Manrope']">
                IRDAI Regulated Brokerage Commission Schedules
              </h3>
              <p className="text-xs text-[#687788]">
                Configured first-year and renewal brokerage slabs in conformity with IRDAI (Payment of Commission) Regulations 2023.
              </p>
            </div>

            <button
              onClick={() => setShowAddScheduleModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Commission Slab</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8EF] shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F9FB] border-b border-[#E2E8EF] text-[#687788]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Slab ID</th>
                  <th className="py-2.5 px-3 font-semibold">Insurer Partner</th>
                  <th className="py-2.5 px-3 font-semibold">Product Category</th>
                  <th className="py-2.5 px-3 font-semibold text-right">First Year Rate</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Renewal Rate</th>
                  <th className="py-2.5 px-3 font-semibold text-right">IRDAI Statutory Cap</th>
                  <th className="py-2.5 px-3 font-semibold">Effective From</th>
                  <th className="py-2.5 px-3 font-semibold">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8EF]">
                {schedules.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F7F9FB]/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#142D4E]">{s.id}</td>
                    <td className="py-2.5 px-3 font-bold text-[#182536]">{s.insurer}</td>
                    <td className="py-2.5 px-3 text-[#182536]">{s.category}</td>
                    <td className="py-2.5 px-3 text-right font-black text-[#16856D]">{s.firstYearRatePct}%</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-[#182536]">{s.renewalRatePct}%</td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#687788]">{s.irdaiCapRatePct}%</td>
                    <td className="py-2.5 px-3 text-[#687788]">{s.effectiveFrom}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16856D]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#16856D]" /> Within Cap
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[#F7F9FB] rounded-xl border border-[#E2E8EF] p-4 text-xs space-y-2">
            <span className="font-bold text-[#142D4E] block">Regulatory Statement — IRDAI Commission Guidelines</span>
            <p className="text-[#687788]">
              Insurance Regulatory and Development Authority of India (Payment of Commission) Regulations, 2023 mandates that total commission payable shall not exceed the Board-approved limit within statutory Expense of Management (EoM) provisions. Fincore brokerage enforces auto-validation capping all entered slabs strictly within these ceilings.
            </p>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 6: WORKFLOWS & LEAD ASSIGNMENT SETTINGS                           */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'workflows' && (
        <form onSubmit={handleSaveWorkflowConfig} className="space-y-6">
          {configSavedToast && (
            <div className="p-3 bg-[#E8F5F2] border border-[#16856D]/30 rounded-xl flex items-center gap-2 text-xs text-[#16856D] font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Workflow & Assignment parameters successfully saved and synchronized across active CRM nodes.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lead Assignment Algorithm Weights */}
            <div className="bg-white rounded-xl border border-[#E2E8EF] p-5 shadow-xs space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#16856D]">Intelligent Routing</span>
                <h3 className="text-base font-bold text-[#142D4E] font-['Manrope'] mt-0.5">
                  Lead Auto-Assignment Engine
                </h3>
                <p className="text-xs text-[#687788]">
                  Configure multi-criteria suitability scoring weights used to allocate inbound leads.
                </p>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8EF]">
                <span className="text-xs font-semibold text-[#182536]">Enable Algorithmic Auto-Assignment</span>
                <input
                  type="checkbox"
                  checked={autoAssignEnabled}
                  onChange={(e) => setAutoAssignEnabled(e.target.checked)}
                  className="w-4 h-4 text-[#16856D] rounded border-[#E2E8EF] focus:ring-[#16856D]"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#182536] mb-1">
                    <span>Workload Capacity Weight</span>
                    <span className="font-mono text-[#16856D]">{workloadWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="5"
                    value={workloadWeight}
                    onChange={(e) => setWorkloadWeight(Number(e.target.value))}
                    className="w-full accent-[#142D4E]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#182536] mb-1">
                    <span>Product Specialization Weight</span>
                    <span className="font-mono text-[#16856D]">{specializationWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="5"
                    value={specializationWeight}
                    onChange={(e) => setSpecializationWeight(Number(e.target.value))}
                    className="w-full accent-[#142D4E]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#182536] mb-1">
                    <span>Geographic Branch Alignment Weight</span>
                    <span className="font-mono text-[#16856D]">{geoWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={geoWeight}
                    onChange={(e) => setGeoWeight(Number(e.target.value))}
                    className="w-full accent-[#142D4E]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#182536] mb-1">
                    <span>Language Proficiency Weight</span>
                    <span className="font-mono text-[#16856D]">{languageWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={languageWeight}
                    onChange={(e) => setLanguageWeight(Number(e.target.value))}
                    className="w-full accent-[#142D4E]"
                  />
                </div>

                <div className="pt-2 flex justify-between text-xs font-bold border-t border-[#E2E8EF]">
                  <span className="text-[#182536]">Total Normalized Weight:</span>
                  <span className={workloadWeight + specializationWeight + geoWeight + languageWeight === 100 ? 'text-[#16856D]' : 'text-[#C44545]'}>
                    {workloadWeight + specializationWeight + geoWeight + languageWeight}%
                  </span>
                </div>
              </div>
            </div>

            {/* SLA & Escalation Settings */}
            <div className="bg-white rounded-xl border border-[#E2E8EF] p-5 shadow-xs space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#16856D]">Follow-up Governance</span>
                <h3 className="text-base font-bold text-[#142D4E] font-['Manrope'] mt-0.5">
                  SLA & Notification Escalations
                </h3>
                <p className="text-xs text-[#687788]">
                  Enforce response times and automatic supervisor escalation triggers.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-[#182536] block mb-1">
                    First Callback SLA Window (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="72"
                    value={firstFollowupHours}
                    onChange={(e) => setFirstFollowupHours(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-[#E2E8EF] rounded-lg focus:outline-none focus:border-[#142D4E]"
                  />
                  <span className="text-[11px] text-[#687788]">New leads trigger alerts if uncontacted after this window.</span>
                </div>

                <div>
                  <label className="font-semibold text-[#182536] block mb-1">
                    Overdue Task Manager Escalation (Hours)
                  </label>
                  <input
                    type="number"
                    min="12"
                    max="168"
                    value={overdueEscalationHours}
                    onChange={(e) => setOverdueEscalationHours(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-[#E2E8EF] rounded-lg focus:outline-none focus:border-[#142D4E]"
                  />
                  <span className="text-[11px] text-[#687788]">Flags task to branch manager if unaddressed.</span>
                </div>

                <div className="pt-3 border-t border-[#E2E8EF] space-y-2">
                  <span className="font-semibold text-[#182536] block">Notification Dispatch Channels:</span>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={notificationEmail}
                      onChange={(e) => setNotificationEmail(e.target.checked)}
                      className="w-4 h-4 text-[#16856D] rounded border-[#E2E8EF]"
                    />
                    <span>Email Alerts (Immediate dispatch to assigned agent)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={notificationWhatsApp}
                      onChange={(e) => setNotificationWhatsApp(e.target.checked)}
                      className="w-4 h-4 text-[#16856D] rounded border-[#E2E8EF]"
                    />
                    <span>WhatsApp Business Gateway (Lead intake confirmations)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white text-xs font-semibold shadow-xs"
            >
              Save Workflow Configurations
            </button>
          </div>
        </form>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 7: AUDIT LOG TRAIL                                                */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 sm:w-80">
              <Search className="w-3.5 h-3.5 text-[#687788] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit trail by actor, action or entity..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E2E8EF] rounded-lg focus:outline-none focus:border-[#142D4E]"
              />
            </div>

            <div className="text-xs text-[#687788]">
              <span>Showing {filteredAuditLogs.length} verified immutable audit events</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8EF] shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F9FB] border-b border-[#E2E8EF] text-[#687788]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Audit Ref</th>
                  <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                  <th className="py-2.5 px-3 font-semibold">Actor Email</th>
                  <th className="py-2.5 px-3 font-semibold">Action Performed</th>
                  <th className="py-2.5 px-3 font-semibold">Entity Type</th>
                  <th className="py-2.5 px-3 font-semibold">Entity ID</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8EF]">
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F7F9FB]/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#142D4E]">{log.id}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#687788]">{log.timestamp}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#182536]">{log.actorEmail}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E9F1F5] text-[#142D4E]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#182536]">{log.entityName}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#687788]">{log.entityId}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedAuditLog(log)}
                        className="text-[11px] font-semibold text-[#16856D] hover:underline"
                      >
                        View Delta
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: INVITE NEW EMPLOYEE                                            */}
      {/* --------------------------------------------------------------------- */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8EF] shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8EF]">
              <div>
                <h3 className="text-base font-bold text-[#142D4E] font-['Manrope']">Invite Brokerage Employee</h3>
                <p className="text-xs text-[#687788]">Send account activation email with designated RBAC role.</p>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-[#687788] hover:text-[#182536] text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#182536] block mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sumit Sen"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8EF] rounded-lg focus:outline-none focus:border-[#142D4E]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#182536] block mb-1">Official Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sumit.sen@fincore.in"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8EF] rounded-lg focus:outline-none focus:border-[#142D4E]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#182536] block mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98200 00000"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8EF] rounded-lg focus:outline-none focus:border-[#142D4E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#182536] block mb-1">Access Role *</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-[#E2E8EF] rounded-lg focus:outline-none focus:border-[#142D4E]"
                  >
                    <option value="sales">Sales Advisor</option>
                    <option value="manager">Manager</option>
                    <option value="operations">Operations</option>
                    <option value="finance">Finance</option>
                    <option value="compliance">Compliance</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#182536] block mb-1">Branch Office</label>
                  <select
                    value={newUserBranch}
                    onChange={(e) => setNewUserBranch(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E2E8EF] rounded-lg focus:outline-none focus:border-[#142D4E]"
                  >
                    <option value="Mumbai HQ">Mumbai HQ</option>
                    <option value="Mumbai Nariman Point">Mumbai Nariman Point</option>
                    <option value="Delhi Connaught Place">Delhi Connaught Place</option>
                    <option value="Bengaluru Indiranagar">Bengaluru Indiranagar</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E2E8EF]">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-[#E2E8EF] rounded-lg text-xs font-semibold text-[#687788] hover:bg-[#F7F9FB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#142D4E] hover:bg-[#1D3D5C] text-white rounded-lg text-xs font-semibold"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: ADD COMMISSION SCHEDULE                                        */}
      {/* --------------------------------------------------------------------- */}
      {showAddScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8EF] shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8EF]">
              <div>
                <h3 className="text-base font-bold text-[#142D4E] font-['Manrope']">Add Regulated Commission Slab</h3>
                <p className="text-xs text-[#687788]">Define insurer commission under IRDAI 2023 regulations.</p>
              </div>
              <button
                onClick={() => setShowAddScheduleModal(false)}
                className="text-[#687788] hover:text-[#182536] text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddSchedule} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#182536] block mb-1">Insurer Partner *</label>
                <select
                  value={newSchedInsurer}
                  onChange={(e) => setNewSchedInsurer(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8EF] rounded-lg focus:outline-none focus:border-[#142D4E]"
                >
                  {SEED_INSURERS.map((ins) => (
                    <option key={ins.id} value={ins.name}>{ins.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#182536] block mb-1">Product Category *</label>
                <select
                  value={newSchedCategory}
                  onChange={(e) => setNewSchedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8EF] rounded-lg focus:outline-none focus:border-[#142D4E]"
                >
                  <option value="Term Insurance">Term Insurance</option>
                  <option value="Whole Life / Traditional">Whole Life / Traditional</option>
                  <option value="ULIPs">ULIPs</option>
                  <option value="Savings / Endowment">Savings / Endowment</option>
                  <option value="Annuity">Annuity</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-[#182536] block mb-1">First Year % *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max={newSchedCap}
                    value={newSchedRate}
                    onChange={(e) => setNewSchedRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#E2E8EF] rounded-lg focus:outline-none focus:border-[#142D4E]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#182536] block mb-1">Renewal %</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="10"
                    value={newSchedRenewal}
                    onChange={(e) => setNewSchedRenewal(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#E2E8EF] rounded-lg focus:outline-none focus:border-[#142D4E]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#182536] block mb-1">IRDAI Cap %</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newSchedCap}
                    onChange={(e) => setNewSchedCap(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#E2E8EF] rounded-lg bg-[#F7F9FB]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E2E8EF]">
                <button
                  type="button"
                  onClick={() => setShowAddScheduleModal(false)}
                  className="px-4 py-2 border border-[#E2E8EF] rounded-lg text-xs font-semibold text-[#687788] hover:bg-[#F7F9FB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#142D4E] hover:bg-[#1D3D5C] text-white rounded-lg text-xs font-semibold"
                >
                  Create Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: AUDIT LOG DELTA VIEWER                                         */}
      {/* --------------------------------------------------------------------- */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8EF] shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8EF]">
              <div>
                <h3 className="text-base font-bold text-[#142D4E] font-['Manrope']">Audit Event Record</h3>
                <span className="font-mono text-xs text-[#687788]">{selectedAuditLog.id} • {selectedAuditLog.timestamp}</span>
              </div>
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="text-[#687788] hover:text-[#182536] text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-[#F7F9FB] rounded-lg border border-[#E2E8EF]">
                <div>
                  <span className="text-[#687788] block text-[10px]">Actor Email</span>
                  <span className="font-bold text-[#182536]">{selectedAuditLog.actorEmail}</span>
                </div>
                <div>
                  <span className="text-[#687788] block text-[10px]">Action Type</span>
                  <span className="font-bold text-[#142D4E]">{selectedAuditLog.action}</span>
                </div>
                <div className="mt-2">
                  <span className="text-[#687788] block text-[10px]">Target Entity</span>
                  <span className="font-semibold text-[#182536]">{selectedAuditLog.entityName}</span>
                </div>
                <div className="mt-2">
                  <span className="text-[#687788] block text-[10px]">Entity Reference</span>
                  <span className="font-mono text-[#182536]">{selectedAuditLog.entityId}</span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-[#182536] block mb-1">State Mutation Delta (JSON):</span>
                <pre className="p-3 bg-[#142D4E] text-[#E9F1F5] rounded-lg font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(JSON.parse(selectedAuditLog.changes || '{}'), null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-3 flex justify-end border-t border-[#E2E8EF]">
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="px-4 py-2 bg-[#142D4E] text-white rounded-lg text-xs font-semibold"
              >
                Close Audit Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
