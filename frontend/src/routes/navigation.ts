import type { ComponentType } from 'react'
import type { UserRole } from '../types/auth'
import {
  LayoutDashboard,
  Users,
  Users2,
  FileText,
  TrendingUp,
  TrendingDown,
  ClipboardList,
  CheckSquare,
  FolderOpen,
  Building2,
  ShieldCheck,
  BarChart3,
  Settings,
  Calculator,
  BrainCircuit,
} from 'lucide-react'

export interface NavItemConfig {
  id: string
  label: string
  path: string
  icon: ComponentType<{ className?: string }>
  badge?: string | number
  roles: UserRole[] // Which roles can see and access this route
  description?: string
  section?: 'Core CRM' | 'Policy Lifecycle' | 'Intelligence & Registry' | 'System'
}

export const ALL_EMPLOYEE_ROLES: UserRole[] = [
  'sales',
  'manager',
  'admin',
  'operations',
  'finance',
  'compliance',
]

export const EMPLOYEE_NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'overview',
    label: 'Overview',
    path: '/app',
    icon: LayoutDashboard,
    roles: ALL_EMPLOYEE_ROLES,
    description: 'Executive dashboard & daily pipeline summary',
    section: 'Core CRM',
  },
  {
    id: 'leads',
    label: 'Leads',
    path: '/app/leads',
    icon: TrendingUp,
    badge: '28',
    roles: ['sales', 'manager', 'admin'],
    description: 'Prospective buyers and lead scoring pipeline',
    section: 'Core CRM',
  },
  {
    id: 'customers',
    label: 'Customers',
    path: '/app/customers',
    icon: Users,
    roles: ['sales', 'manager', 'admin', 'operations', 'compliance'],
    description: 'Customer 360° profiles and interaction logs',
    section: 'Core CRM',
  },
  {
    id: 'assessments',
    label: 'Assessments',
    path: '/app/assessments',
    icon: Calculator,
    roles: ['sales', 'manager', 'admin', 'compliance'],
    description: 'Multi-step insurance needs calculations',
    section: 'Core CRM',
  },
  {
    id: 'quotations',
    label: 'Quotations',
    path: '/app/quotations',
    icon: FileText,
    badge: '14',
    roles: ['sales', 'manager', 'admin', 'operations', 'finance', 'compliance'],
    description: 'Multi-insurer comparison quotes and proposals',
    section: 'Policy Lifecycle',
  },
  {
    id: 'applications',
    label: 'Applications',
    path: '/app/applications',
    icon: ClipboardList,
    badge: '9',
    roles: ['sales', 'manager', 'admin', 'operations', 'finance', 'compliance'],
    description: 'Insurer proposal tracking & policy status',
    section: 'Policy Lifecycle',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    path: '/app/tasks',
    icon: CheckSquare,
    badge: '5',
    roles: ['sales', 'manager', 'admin', 'operations'],
    description: 'Follow-ups, document requests, and agent assignments',
    section: 'Policy Lifecycle',
  },
  {
    id: 'documents',
    label: 'Documents',
    path: '/app/documents',
    icon: FolderOpen,
    roles: ['sales', 'manager', 'admin', 'operations', 'compliance'],
    description: 'KYC, PAN, proposal forms, and medical records',
    section: 'Policy Lifecycle',
  },
  {
    id: 'insurers',
    label: 'Insurers',
    path: '/app/insurers',
    icon: Building2,
    roles: ['manager', 'admin', 'operations', 'finance', 'compliance'],
    description: 'Authorised life insurer partner directory',
    section: 'Intelligence & Registry',
  },
  {
    id: 'products',
    label: 'Products',
    path: '/app/products',
    icon: ShieldCheck,
    roles: ['sales', 'manager', 'admin', 'operations', 'compliance'],
    description: 'Versioned insurance product catalogue',
    section: 'Intelligence & Registry',
  },
  {
    id: 'analytics',
    label: 'BI Dashboard',
    path: '/app/analytics',
    icon: BarChart3,
    roles: ['manager', 'admin', 'finance'],
    description: 'Executive overview: KPIs, funnel, conversion analytics',
    section: 'Intelligence & Registry',
  },
  {
    id: 'employee-analytics',
    label: 'Employee Analytics',
    path: '/app/admin/employees',
    icon: Users2,
    roles: ['manager', 'admin'],
    description: 'Agent performance and productivity metrics',
    section: 'Intelligence & Registry',
  },
  {
    id: 'insurer-analytics',
    label: 'Insurer Analytics',
    path: '/app/admin/insurers-analytics',
    icon: Building2,
    roles: ['manager', 'admin', 'finance'],
    description: 'Partner insurer volume and commission tracking',
    section: 'Intelligence & Registry',
  },
  {
    id: 'product-analytics',
    label: 'Product Analytics',
    path: '/app/admin/products-analytics',
    icon: ShieldCheck,
    roles: ['manager', 'admin'],
    description: 'Product performance and conversion by category',
    section: 'Intelligence & Registry',
  },
  {
    id: 'lost-leads',
    label: 'Lost Lead Intel',
    path: '/app/admin/lost-leads',
    icon: TrendingDown,
    roles: ['manager', 'admin'],
    description: 'Lost lead pattern analysis and actionable insights',
    section: 'Intelligence & Registry',
  },
  {
    id: 'ai-models',
    label: 'AI & ML Models',
    path: '/app/admin/models',
    icon: BrainCircuit,
    roles: ['manager', 'admin'],
    description: 'Model governance, lead scoring simulator & policy RAG',
    section: 'Intelligence & Registry',
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/app/settings',
    icon: Settings,
    roles: ['admin', 'manager', 'compliance'],
    description: 'Role permissions, audit log & broker config',
    section: 'System',
  },
]

export const PUBLIC_NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Insurance', path: '/insurance' },
  { label: 'Compare', path: '/compare' },
  { label: 'Needs Assessment', path: '/assessment' },
  { label: 'How it works', path: '/about#how-it-works' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
]
