import React from 'react'
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Plus,
  Clock,
  Sparkles,
} from 'lucide-react'

export const InsurersPage: React.FC = () => {
  const insurers = [
    {
      name: 'HDFC Life Insurance Co. Ltd.',
      irdaiRef: 'IRDAI/NL-001/LIFE',
      claimRatio: '99.50%',
      integrationMode: 'REST API & Demo Feed',
      activeProducts: 4,
      avgTat: '3 business days',
      status: 'Active Partner',
    },
    {
      name: 'ICICI Prudential Life Insurance Co. Ltd.',
      irdaiRef: 'IRDAI/NL-002/LIFE',
      claimRatio: '99.17%',
      integrationMode: 'REST API & Demo Feed',
      activeProducts: 3,
      avgTat: '2 business days',
      status: 'Active Partner',
    },
    {
      name: 'SBI Life Insurance Co. Ltd.',
      irdaiRef: 'IRDAI/NL-009/LIFE',
      claimRatio: '97.05%',
      integrationMode: 'SFTP Rate Card & Demo',
      activeProducts: 3,
      avgTat: '4 business days',
      status: 'Active Partner',
    },
    {
      name: 'Max Life Insurance Co. Ltd.',
      irdaiRef: 'IRDAI/NL-004/LIFE',
      claimRatio: '99.51%',
      integrationMode: 'REST API & Demo Feed',
      activeProducts: 2,
      avgTat: '3 business days',
      status: 'Active Partner',
    },
    {
      name: 'Life Insurance Corporation of India (LIC)',
      irdaiRef: 'Statutory Corp (LIC Act 1956)',
      claimRatio: '98.50%',
      integrationMode: 'Bima Portal Integration',
      activeProducts: 2,
      avgTat: '5 business days',
      status: 'Active Partner',
    },
    {
      name: 'Tata AIA Life Insurance Co. Ltd.',
      irdaiRef: 'IRDAI/NL-011/LIFE',
      claimRatio: '99.01%',
      integrationMode: 'REST API & Demo Feed',
      activeProducts: 2,
      avgTat: '2 business days',
      status: 'Active Partner',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8EF]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#16856D]">
            Carrier Relationships & Integration
          </span>
          <h1 className="text-2xl font-bold text-[#142D4E] font-['Manrope'] mt-0.5">
            Authorised Life Insurers Directory
          </h1>
          <p className="text-xs text-[#687788]">
            Master carrier registry and integration configurations for authorised life insurance partners.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insurers.map((ins, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-[#E2E8EF] p-5 shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#16856D] bg-[#E8F5F2] px-2 py-0.5 rounded">
                  {ins.status}
                </span>
                <span className="text-xs font-bold text-[#142D4E]">
                  {ins.claimRatio} CSR
                </span>
              </div>
              <h3 className="text-base font-bold text-[#142D4E] font-['Manrope']">
                {ins.name}
              </h3>
              <p className="text-[11px] text-[#687788] font-mono">{ins.irdaiRef}</p>
            </div>

            <div className="pt-3 border-t border-[#E2E8EF] space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#687788]">Data Integration:</span>
                <span className="font-medium text-[#182536]">{ins.integrationMode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#687788]">Catalogued Plans:</span>
                <span className="font-bold text-[#142D4E]">{ins.activeProducts} Products</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#687788]">Underwriting TAT:</span>
                <span className="font-medium text-[#182536]">{ins.avgTat}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
