import React from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Building2,
  FileText,
  Users,
  CheckCircle,
  HelpCircle,
  ExternalLink,
  ArrowRight,
  Scale,
  Award,
  HeartHandshake,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react'

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* 1. Header & Introduction */}
      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#16856D]">
          About FINCORE
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#142D4E] font-['Manrope'] tracking-tight">
          Authorised Insurance Broking Built on Fiduciary Responsibility
        </h1>
        <p className="text-base sm:text-lg text-[#687788] leading-relaxed">
          FINCORE is not an insurance company. We are a technology-first, IRDAI-registered direct life insurance broker headquartered in Mumbai, dedicated to bringing clarity, institutional rigor, and unbiased guidance to life insurance decisions across India.
        </p>
      </div>

      {/* 2. Direct Insurance Broker Mandate Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8EF] p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#E2E8EF]">
          <div className="w-10 h-10 rounded-xl bg-[#E8F5F2] text-[#16856D] flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#142D4E] font-['Manrope']">
              Regulatory Registration & Brokerage Mandate
            </h2>
            <p className="text-xs text-[#687788]">
              Insurance Regulatory and Development Authority of India (IRDAI)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <span className="text-xs text-[#687788] block">Corporate Identity</span>
            <span className="font-semibold text-[#182536] block mt-1">
              FINCORE Insurance Broking Services Pvt. Ltd.
            </span>
            <span className="text-xs text-[#687788]">CIN: U66000MH2024PTC392810</span>
          </div>
          <div>
            <span className="text-xs text-[#687788] block">IRDAI Broker License Number</span>
            <span className="font-semibold text-[#142D4E] font-mono block mt-1">
              IRDAI/DB/892/2024 (Direct Broker - Life)
            </span>
            <span className="text-xs text-[#16856D] font-medium">Authorised Category: Life Insurance</span>
          </div>
          <div>
            <span className="text-xs text-[#687788] block">Registered Corporate Office</span>
            <span className="font-semibold text-[#182536] block mt-1">
              Level 14, Platina Tower, Bandra Kurla Complex (BKC)
            </span>
            <span className="text-xs text-[#687788]">Mumbai 400051, Maharashtra, India</span>
          </div>
        </div>
      </div>

      {/* 3. The Role of an Insurance Broker (Critical Explanation) */}
      <section className="space-y-6">
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#16856D]">
            Regulatory Distinction
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142D4E] font-['Manrope']">
            Understanding the Role of an Insurance Broker
          </h2>
          <p className="text-sm text-[#687788]">
            Many consumers confuse insurance companies, corporate agents, and insurance brokers. Here is how our legal and operational role functions under Indian insurance law:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="bg-white rounded-xl border border-[#E2E8EF] p-6 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C44545] bg-[#FDF2F2] px-2 py-0.5 rounded">
              Insurance Company (Insurer)
            </span>
            <h3 className="text-base font-bold text-[#142D4E] font-['Manrope']">
              The Underwriting Carrier
            </h3>
            <p className="text-xs text-[#687788] leading-relaxed">
              Insurance companies (e.g. HDFC Life, ICICI Prudential, LIC) take the balance sheet financial risk, underwrite policies, collect premiums, and pay out claims. They only market and sell their own proprietary products.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8EF] p-6 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C58A36] bg-[#FFF8EE] px-2 py-0.5 rounded">
              Insurance Agent (Agency)
            </span>
            <h3 className="text-base font-bold text-[#142D4E] font-['Manrope']">
              Tied Representative of the Insurer
            </h3>
            <p className="text-xs text-[#687788] leading-relaxed">
              An insurance agent or corporate bank agent is appointed directly by a specific insurer. Legally, the agent represents the insurance company’s commercial interest, promoting only the carrier's in-house plans.
            </p>
          </div>

          <div className="bg-white rounded-xl border-2 border-[#16856D] p-6 space-y-3 relative shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#16856D] bg-[#E8F5F2] px-2 py-0.5 rounded">
              Insurance Broker (FINCORE)
            </span>
            <h3 className="text-base font-bold text-[#142D4E] font-['Manrope']">
              Legal Representative of the Buyer
            </h3>
            <p className="text-xs text-[#182536] leading-relaxed font-medium">
              As an authorised broker, FINCORE has a legal fiduciary obligation to <em>you</em>. We survey the entire life insurance market, evaluate wordings impartially, and assist nominees through all claim settlement processes at ₹0 cost.
            </p>
          </div>
        </div>
      </section>

      {/* 4. How the Brokerage Platform Works */}
      <section id="how-it-works" className="space-y-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#16856D]">
            Our Operating Model
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142D4E] font-['Manrope']">
            How the FINCORE Platform Works
          </h2>
          <p className="text-sm text-[#687788]">
            We replace high-pressure sales pitches with transparent data, actuarial formulas, and end-to-end customer support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Objective Needs Assessment',
              desc: 'We calculate your Human Life Value based on debt obligations, family expenses, and education milestones. We tell you the exact cover you need—nothing more, nothing less.',
            },
            {
              step: '02',
              title: 'Transparent Multi-Insurer Scrutiny',
              desc: 'Our engine presents policy brochures side-by-side. We highlight exclusions, pre-existing condition rules, and CSR records so you understand every clause before applying.',
            },
            {
              step: '03',
              title: 'Frictionless Proposal Processing',
              desc: 'We assist with statutory KYC verification and coordinate diagnostic tele-interviews. We ensure all medical history is accurately declared so your policy is legally bulletproof.',
            },
            {
              step: '04',
              title: 'Lifelong Claim Advocacy',
              desc: 'Once the carrier issues your policy schedule, FINCORE logs your policy in our secure vault. In the event of a future claim, our Claims Concierge stands with your family.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white rounded-xl border border-[#E2E8EF] p-6 relative flex flex-col justify-between hover:border-[#142D4E] transition-colors"
            >
              <div>
                <span className="text-2xl font-black text-[#16856D] font-['Manrope'] block mb-2">
                  {item.step}
                </span>
                <h3 className="text-base font-bold text-[#142D4E] font-['Manrope'] mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-[#687788] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Customer-First Approach */}
      <section className="bg-white rounded-2xl border border-[#E2E8EF] p-8 sm:p-10 space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#16856D]">
            Customer-First Philosophy
          </span>
          <h2 className="text-2xl font-bold text-[#142D4E] font-['Manrope']">
            Our Core Consumer Commitments
          </h2>
          <p className="text-xs text-[#687788]">
            How we protect your peace of mind and data privacy every single day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#F7F9FB] border border-[#E2E8EF]">
            <CheckCircle className="w-5 h-5 text-[#16856D] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#182536]">Zero Spam & Data Sovereignty</p>
              <p className="text-xs text-[#687788] mt-1 leading-relaxed">
                Your contact details and PAN numbers are protected under the Digital Personal Data Protection Act (DPDP) and IRDAI cybersecurity guidelines. We never share or resell consumer data to telemarketers.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#F7F9FB] border border-[#E2E8EF]">
            <CheckCircle className="w-5 h-5 text-[#16856D] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#182536]">No Underwriting Distortion</p>
              <p className="text-xs text-[#687788] mt-1 leading-relaxed">
                FINCORE never promises fake approvals or conceals health details to push a sale. Full medical disclosure protects the 3-year Section 45 incontestability threshold, ensuring claims are honored.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#F7F9FB] border border-[#E2E8EF]">
            <CheckCircle className="w-5 h-5 text-[#16856D] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#182536]">Regulated Commission Parity</p>
              <p className="text-xs text-[#687788] mt-1 leading-relaxed">
                Our remuneration is strictly aligned with the IRDAI (Payment of Commission or Remuneration) Regulations, 2023. Our advisory is provided to customers without adding any markup or hidden consultancy cost.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#F7F9FB] border border-[#E2E8EF]">
            <CheckCircle className="w-5 h-5 text-[#16856D] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#182536]">Active Claims Concierge</p>
              <p className="text-xs text-[#687788] mt-1 leading-relaxed">
                Our team provides end-to-end death claim filing, hospital document assembly, and insurer liaison support so grieving nominees receive designated payouts promptly and without friction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Contact & Operational Bureau Information */}
      <section className="bg-[#142D4E] text-white rounded-2xl p-8 sm:p-12 space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#16856D]">
            Official Coordinates
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-['Manrope']">
            Contact & Principal Office Information
          </h2>
          <p className="text-sm text-white/80">
            Reach out to our compliance bureau or licensed broker advisory team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-[#16856D]">
              <Building2 className="w-4 h-4" />
              <span className="font-bold text-white uppercase tracking-wider">Corporate Headquarters</span>
            </div>
            <p className="text-white/80 leading-relaxed">
              Level 14, Platina Tower<br />
              Bandra Kurla Complex (BKC)<br />
              Mumbai 400051, Maharashtra, India
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-[#16856D]">
              <Phone className="w-4 h-4" />
              <span className="font-bold text-white uppercase tracking-wider">Telephony Lines</span>
            </div>
            <p className="text-white/80 leading-relaxed">
              <strong>Toll-Free Advisory:</strong> 1800-419-8800<br />
              <strong>Board Line:</strong> +91-22-6100-8000<br />
              <strong>Hours:</strong> Mon – Sat, 9:00 AM – 7:00 PM IST
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-[#16856D]">
              <Mail className="w-4 h-4" />
              <span className="font-bold text-white uppercase tracking-wider">Electronic Inquiries</span>
            </div>
            <p className="text-white/80 leading-relaxed">
              <strong>Advisory Desk:</strong> contact@fincore.in<br />
              <strong>Claims Concierge:</strong> claims@fincore.in<br />
              <strong>Compliance Officer:</strong> compliance@fincore.in
            </p>
          </div>
        </div>
      </section>

      {/* 7. CTA */}
      <div className="text-center pt-2">
        <Link
          to="/assessment"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#16856D] text-white font-semibold text-sm hover:bg-[#0F6B57] transition-all shadow-sm active:scale-[0.98]"
        >
          <span>Calculate Your Family's Insurance Need</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
