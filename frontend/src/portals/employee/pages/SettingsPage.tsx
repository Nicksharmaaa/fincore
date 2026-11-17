import React from 'react'
import {
  Settings,
  ShieldCheck,
  Lock,
  Users,
  FileText,
  Clock,
  CheckCircle2,
} from 'lucide-react'

export const SettingsPage: React.FC = () => {
  const auditLogs = [
    {
      id: 'AUD-8801',
      actor: 'Amit Kumar (Sales)',
      action: 'GENERATED_INDICATIVE_QUOTE',
      target: 'Lead #LD-1092 (Rajesh Verma)',
      time: '16-Nov-2026, 14:22 IST',
      ip: '10.0.4.12',
    },
    {
      id: 'AUD-8802',
      actor: 'Sneha Reddy (Operations)',
      action: 'VERIFIED_CUSTOMER_PAN',
      target: 'Customer #CUST-801 (Rajesh Verma)',
      time: '16-Nov-2026, 13:45 IST',
      ip: '10.0.2.88',
    },
    {
      id: 'AUD-8803',
      actor: 'Vikram Malhotra (Admin)',
      action: 'UPDATED_ROLE_PERMISSIONS',
      target: 'Role: Compliance (Audited Needs Assessments)',
      time: '15-Nov-2026, 18:00 IST',
      ip: '10.0.1.5',
    },
  ]

  const roleMatrix = [
    { module: 'Overview Dashboard', sales: true, manager: true, admin: true, ops: true, fin: true, comp: true },
    { module: 'Leads CRM & Intake', sales: true, manager: true, admin: true, ops: false, fin: false, comp: false },
    { module: 'Customer 360° Directory', sales: true, manager: true, admin: true, ops: true, fin: false, comp: true },
    { module: 'Needs Assessments', sales: true, manager: true, admin: true, ops: false, fin: false, comp: true },
    { module: 'Quotations Management', sales: true, manager: true, admin: true, ops: true, fin: true, comp: true },
    { module: 'Applications Pipeline', sales: true, manager: true, admin: true, ops: true, fin: true, comp: true },
    { module: 'KYC & Document Ops', sales: true, manager: true, admin: true, ops: true, fin: false, comp: true },
    { module: 'Insurers Directory', sales: false, manager: true, admin: true, ops: true, fin: true, comp: true },
    { module: 'Product Versioning Admin', sales: true, manager: true, admin: true, ops: true, fin: false, comp: true },
    { module: 'Executive Analytics', sales: false, manager: true, admin: true, ops: false, fin: true, comp: false },
    { module: 'Broker System Settings', sales: false, manager: true, admin: true, ops: false, fin: false, comp: true },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8EF]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#16856D]">
            Governance & Administration
          </span>
          <h1 className="text-2xl font-bold text-[#142D4E] font-['Manrope'] mt-0.5">
            Role Permissions & Brokerage Audit Logs
          </h1>
          <p className="text-xs text-[#687788]">
            RBAC permission matrix and immutable audit trail mandated for authorised life insurance brokerage compliance.
          </p>
        </div>
      </div>

      {/* Role Matrix */}
      <div className="bg-white rounded-xl border border-[#E2E8EF] shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#16856D]" />
          <h3 className="text-sm font-bold text-[#142D4E] font-['Manrope']">
            Role-Based Access Control (RBAC) Matrix
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9FB] border-b border-[#E2E8EF] text-[#687788]">
              <tr>
                <th className="py-2.5 px-3 font-semibold">CRM Module</th>
                <th className="py-2.5 px-3 font-semibold text-center">Sales</th>
                <th className="py-2.5 px-3 font-semibold text-center">Manager</th>
                <th className="py-2.5 px-3 font-semibold text-center">Admin</th>
                <th className="py-2.5 px-3 font-semibold text-center">Operations</th>
                <th className="py-2.5 px-3 font-semibold text-center">Finance</th>
                <th className="py-2.5 px-3 font-semibold text-center">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8EF]">
              {roleMatrix.map((r, i) => (
                <tr key={i} className="hover:bg-[#F7F9FB]/50">
                  <td className="py-2.5 px-3 font-medium text-[#182536]">{r.module}</td>
                  <td className="py-2.5 px-3 text-center">{r.sales ? '✅' : '—'}</td>
                  <td className="py-2.5 px-3 text-center">{r.manager ? '✅' : '—'}</td>
                  <td className="py-2.5 px-3 text-center">{r.admin ? '✅' : '—'}</td>
                  <td className="py-2.5 px-3 text-center">{r.ops ? '✅' : '—'}</td>
                  <td className="py-2.5 px-3 text-center">{r.fin ? '✅' : '—'}</td>
                  <td className="py-2.5 px-3 text-center">{r.comp ? '✅' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-xl border border-[#E2E8EF] shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#16856D]" />
            <h3 className="text-sm font-bold text-[#142D4E] font-['Manrope']">
              Immutable Operation Audit Log
            </h3>
          </div>
          <span className="text-[11px] text-[#687788]">Retention period: 7 Years (IRDAI)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9FB] border-b border-[#E2E8EF] text-[#687788]">
              <tr>
                <th className="py-2 px-3 font-semibold">Audit Ref</th>
                <th className="py-2 px-3 font-semibold">Actor / User</th>
                <th className="py-2 px-3 font-semibold">Operation</th>
                <th className="py-2 px-3 font-semibold">Target Record</th>
                <th className="py-2 px-3 font-semibold">Timestamp</th>
                <th className="py-2 px-3 font-semibold font-mono">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8EF]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F7F9FB]/50">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#142D4E]">{log.id}</td>
                  <td className="py-2.5 px-3 font-semibold text-[#182536]">{log.actor}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#16856D]">{log.action}</td>
                  <td className="py-2.5 px-3 text-[#182536]">{log.target}</td>
                  <td className="py-2.5 px-3 text-[#687788]">{log.time}</td>
                  <td className="py-2.5 px-3 font-mono text-[#687788]">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
