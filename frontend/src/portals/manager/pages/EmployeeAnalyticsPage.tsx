import React, { useState, useEffect } from 'react'
import { Search, ChevronUp, ChevronDown, Users } from 'lucide-react'

const IS_DEMO = true

const DemoBadge = () =>
  IS_DEMO ? (
    <span className="text-[10px] font-bold text-[#C58A36] bg-[#FDF7EE] border border-[#C58A36]/20 px-1.5 py-0.5 rounded">
      DEMO DATA
    </span>
  ) : null

interface EmployeeRow {
  id: string
  name: string
  team: string
  leadsAssigned: number
  responseTimeHrs: number
  quotes: number
  applications: number
  policies: number
  tasksDone: number
  tasksOverdue: number
  conversionPct: number
}

const SEED_EMPLOYEES: EmployeeRow[] = [
  { id: 'USR-001', name: 'Arjun Kapoor', team: 'Sales', leadsAssigned: 68, responseTimeHrs: 1.2, quotes: 44, applications: 22, policies: 15, tasksDone: 32, tasksOverdue: 2, conversionPct: 22.1 },
  { id: 'USR-002', name: 'Neha Verma', team: 'Sales', leadsAssigned: 55, responseTimeHrs: 2.1, quotes: 36, applications: 18, policies: 10, tasksDone: 28, tasksOverdue: 4, conversionPct: 18.2 },
  { id: 'USR-003', name: 'Rajesh Kumar', team: 'Sales', leadsAssigned: 49, responseTimeHrs: 1.8, quotes: 30, applications: 14, policies: 10, tasksDone: 25, tasksOverdue: 1, conversionPct: 20.4 },
  { id: 'USR-004', name: 'Priya Sharma', team: 'Operations', leadsAssigned: 44, responseTimeHrs: 3.4, quotes: 27, applications: 12, policies: 7, tasksDone: 40, tasksOverdue: 6, conversionPct: 15.9 },
  { id: 'USR-005', name: 'Deepak Joshi', team: 'Sales', leadsAssigned: 38, responseTimeHrs: 2.8, quotes: 22, applications: 9, policies: 5, tasksDone: 18, tasksOverdue: 3, conversionPct: 13.2 },
  { id: 'USR-006', name: 'Meena Nair', team: 'Compliance', leadsAssigned: 28, responseTimeHrs: 4.1, quotes: 15, applications: 6, policies: 3, tasksDone: 36, tasksOverdue: 0, conversionPct: 10.7 },
]

type SortKey = keyof EmployeeRow
type SortDir = 'asc' | 'desc'

export const EmployeeAnalyticsPage: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeRow[]>(SEED_EMPLOYEES)
  const [teamFilter, setTeamFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('leadsAssigned')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    fetch('/api/v1/analytics/employee-performance', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (Array.isArray(data) && data.length > 0) setEmployees(data) })
      .catch(() => {})
  }, [])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const filtered = employees
    .filter((e) => teamFilter === 'All' || e.team === teamFilter)
    .filter((e) => !search || e.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const av = a[sortKey] as number | string
      const bv = b[sortKey] as number | string
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av
      }
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })

  const totals = {
    leadsAssigned: filtered.reduce((s, e) => s + e.leadsAssigned, 0),
    quotes: filtered.reduce((s, e) => s + e.quotes, 0),
    applications: filtered.reduce((s, e) => s + e.applications, 0),
    policies: filtered.reduce((s, e) => s + e.policies, 0),
    tasksDone: filtered.reduce((s, e) => s + e.tasksDone, 0),
    tasksOverdue: filtered.reduce((s, e) => s + e.tasksOverdue, 0),
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 text-[#E2E8EF]" />
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-[#142D4E]" />
    ) : (
      <ChevronDown className="w-3 h-3 text-[#142D4E]" />
    )
  }

  const convColor = (pct: number) =>
    pct >= 20 ? 'text-[#16856D]' : pct >= 10 ? 'text-[#C58A36]' : 'text-[#C44545]'

  const cols: { label: string; key: SortKey; align?: string }[] = [
    { label: 'Name', key: 'name' },
    { label: 'Team', key: 'team' },
    { label: 'Leads', key: 'leadsAssigned', align: 'text-center' },
    { label: 'Resp. Time', key: 'responseTimeHrs', align: 'text-center' },
    { label: 'Quotes', key: 'quotes', align: 'text-center' },
    { label: 'Applications', key: 'applications', align: 'text-center' },
    { label: 'Policies', key: 'policies', align: 'text-center' },
    { label: 'Tasks Done', key: 'tasksDone', align: 'text-center' },
    { label: 'Overdue', key: 'tasksOverdue', align: 'text-center' },
    { label: 'Conv%', key: 'conversionPct', align: 'text-center' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8EF]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#16856D]">
            People Analytics
          </span>
          <h1 className="text-2xl font-bold text-[#142D4E] font-['Manrope'] mt-0.5">
            Employee Performance Analytics
          </h1>
          <p className="text-xs text-[#687788] mt-0.5">
            Advisor-level productivity metrics, task completion, and conversion benchmarks.
          </p>
        </div>
        <Users className="w-8 h-8 text-[#E2E8EF] shrink-0" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="text-xs border border-[#E2E8EF] rounded-lg px-3 py-2 bg-white text-[#182536] focus:outline-none focus:border-[#142D4E]"
        >
          {['All', 'Sales', 'Operations', 'Compliance'].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#687788]" />
          <input
            type="text"
            placeholder="Search employee…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs border border-[#E2E8EF] rounded-lg pl-8 pr-3 py-2 bg-white text-[#182536] focus:outline-none focus:border-[#142D4E] w-44"
          />
        </div>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="text-xs border border-[#E2E8EF] rounded-lg px-3 py-2 bg-white text-[#182536] focus:outline-none focus:border-[#142D4E]"
        />
        <span className="text-xs text-[#687788]">to</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="text-xs border border-[#E2E8EF] rounded-lg px-3 py-2 bg-white text-[#182536] focus:outline-none focus:border-[#142D4E]"
        />
        <DemoBadge />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E2E8EF] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#F7F9FB] border-b border-[#E2E8EF]">
              <tr>
                {cols.map((col) => (
                  <th
                    key={col.key}
                    className={`py-2.5 px-3 font-semibold text-[#687788] cursor-pointer select-none hover:text-[#142D4E] ${col.align || 'text-left'}`}
                    onClick={() => handleSort(col.key)}
                  >
                    <span className="inline-flex items-center gap-0.5">
                      {col.label} <SortIcon col={col.key} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8EF]">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#F7F9FB] transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-[#182536]">{emp.name}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] font-bold text-[#687788] bg-[#E9F1F5] px-1.5 py-0.5 rounded">
                      {emp.team}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-semibold text-[#182536]">{emp.leadsAssigned}</td>
                  <td className="py-2.5 px-3 text-center text-[#687788]">{emp.responseTimeHrs}h</td>
                  <td className="py-2.5 px-3 text-center text-[#182536]">{emp.quotes}</td>
                  <td className="py-2.5 px-3 text-center text-[#182536]">{emp.applications}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-[#16856D]">{emp.policies}</td>
                  <td className="py-2.5 px-3 text-center text-[#182536]">{emp.tasksDone}</td>
                  <td className="py-2.5 px-3 text-center">
                    {emp.tasksOverdue > 0 ? (
                      <span className="inline-block text-[10px] font-bold text-white bg-[#C44545] px-1.5 py-0.5 rounded-full">
                        {emp.tasksOverdue}
                      </span>
                    ) : (
                      <span className="text-[#16856D] font-bold">0</span>
                    )}
                  </td>
                  <td className={`py-2.5 px-3 text-center font-bold ${convColor(emp.conversionPct)}`}>
                    {emp.conversionPct}%
                  </td>
                </tr>
              ))}

              {/* Summary Row */}
              <tr className="bg-[#E9F1F5] font-bold border-t-2 border-[#E2E8EF]">
                <td className="py-2.5 px-3 text-[#142D4E]">Team Total</td>
                <td className="py-2.5 px-3" />
                <td className="py-2.5 px-3 text-center text-[#142D4E]">{totals.leadsAssigned}</td>
                <td className="py-2.5 px-3 text-center text-[#687788]">—</td>
                <td className="py-2.5 px-3 text-center text-[#142D4E]">{totals.quotes}</td>
                <td className="py-2.5 px-3 text-center text-[#142D4E]">{totals.applications}</td>
                <td className="py-2.5 px-3 text-center text-[#16856D]">{totals.policies}</td>
                <td className="py-2.5 px-3 text-center text-[#142D4E]">{totals.tasksDone}</td>
                <td className="py-2.5 px-3 text-center text-[#C44545]">{totals.tasksOverdue}</td>
                <td className="py-2.5 px-3 text-center text-[#142D4E]">
                  {totals.leadsAssigned > 0
                    ? ((totals.policies / totals.leadsAssigned) * 100).toFixed(1)
                    : '0.0'}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
