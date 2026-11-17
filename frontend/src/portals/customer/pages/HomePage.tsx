import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  ArrowRight,
  Calculator,
  Scale,
  CheckCircle2,
  FileCheck2,
  Lock,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Info,
  BookOpen,
  Award,
  BadgeAlert,
  Building2,
  Clock,
  HeartHandshake,
  TrendingUp,
} from 'lucide-react'
import { INSURANCE_CATEGORIES, PRODUCTS_CATALOG } from '../data/products'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()

  // Interactive Hero Estimator state
  const [age, setAge] = useState<number>(30)
  const [annualIncome, setAnnualIncome] = useState<number>(1800000)
  const [dependents, setDependents] = useState<number>(2)
  const [isSmoker, setIsSmoker] = useState<boolean>(false)

  // Quick mathematical HLV estimation
  // Formula: (Annual Income * 12) + (Dependents * 25L for education/living)
  const estimatedHlv = Math.round((annualIncome * 12 + dependents * 2500000) / 10000000) * 10000000 // In Crore
  const displayCover = estimatedHlv >= 10000000 ? `₹${estimatedHlv / 10000000} Crore` : `₹50 Lakh`
  const baseMonthly = isSmoker ? Math.round(750 * 1.65) : 780
  const adjustedMonthly = Math.round((baseMonthly * (estimatedHlv / 10000000)) * (1 + (age - 25) * 0.035))

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  const faqs = [
    {
      q: 'What is the legal difference between an insurance broker and an insurance agent?',
      a: 'An insurance agent is legally appointed by and represents a single insurance company to sell its specific products. In contrast, an authorised Insurance Broker (governed by the IRDAI Insurance Brokers Regulations) is legally mandated to represent the insurance buyer (you). Fincore maintains an independent fiduciary duty to assess your financial protection needs, compare policies across multiple insurers objectively, and assist your nominees throughout the life of the policy during claim settlement.',
    },
    {
      q: 'Does purchasing through Fincore cost more than buying directly from the insurer?',
      a: 'No. Under IRDAI regulations, premiums for a given policy product, variant, and underwriting risk profile are strictly identical whether purchased directly through an insurance carrier or via an authorised direct broker. Fincore charges zero advisory fees to consumers; our broker remuneration is regulated and disbursed directly by partner insurers in accordance with IRDAI commission ceilings.',
    },
    {
      q: 'How does Fincore assist my family when an insurance claim arises?',
      a: 'We provide a dedicated Claims Concierge service at zero cost. When an unfortunate event occurs, your nominees do not have to navigate complicated insurer bureaucratic procedures alone. Fincore reviews claim documents, verifies policy terms under Section 45, liaises with the carrier’s claim underwriting committee, and tracks timely payout disbursement into your nominee’s verified bank account.',
    },
    {
      q: 'What is Section 45 of the Insurance Act, 1938, and why does it protect policyholders?',
      a: 'Section 45 contains the statutory 3-year incontestability clause. Under Indian law, once a life insurance policy has been in force continuously for 3 years (from the date of issuance, commencement of risk, or revival), no insurer can repudiate or question a death claim on the grounds of misstatement, fraud, or non-disclosure of medical facts. This provides immense peace of mind for families holding verified long-term policies.',
    },
    {
      q: 'What is the 30-day Free Look Period?',
      a: 'IRDAI mandates a statutory 30-day Free Look Period for all life insurance policies purchased electronically. Once you receive your official policy schedule, you have 30 days to review the fine print, exclusions, and benefit schedules. If you are unsatisfied for any reason, you may return the policy and receive a refund of premiums paid, less stamp duty, medical test costs, and proportionate risk cover.',
    },
    {
      q: 'Are medical checkups mandatory for getting term insurance?',
      a: 'Medical requirements depend on your age, declared sum assured, and medical history. Most partner insurers require tele-medical interviews (video consultation with a certified doctor) or standard diagnostic checks (blood profile, ECG) for coverage of ₹1 Crore and above to ensure complete claim security. Fincore coordinates convenient home sample collection at zero expense to you.',
    },
  ]

  const partnerComparisonMatrix = [
    {
      insurer: 'HDFC Life Insurance',
      code: 'HDFC_LIFE',
      csr: '99.50%',
      solvency: '1.98',
      avgSettlement: '3 Business Days',
      indicativeRate1Cr: '₹780 / mo',
      ciCover: 'Up to 64 Illnesses',
      smartExit: 'Available at Age 60',
    },
    {
      insurer: 'ICICI Prudential Life',
      code: 'ICICI_PRU',
      csr: '99.17%',
      solvency: '2.05',
      avgSettlement: '2 Business Days',
      indicativeRate1Cr: '₹810 / mo',
      ciCover: 'Up to 34 Illnesses',
      smartExit: 'Available at Age 65',
    },
    {
      insurer: 'Max Life Insurance',
      code: 'MAX_LIFE',
      csr: '99.51%',
      solvency: '1.92',
      avgSettlement: '1 Business Day (InstaClaim)',
      indicativeRate1Cr: '₹760 / mo',
      ciCover: 'Up to 40 Illnesses',
      smartExit: 'Available at Age 65',
    },
    {
      insurer: 'Life Insurance Corporation (LIC)',
      code: 'LIC_INDIA',
      csr: '98.50%',
      solvency: '1.90',
      avgSettlement: '5 Business Days',
      indicativeRate1Cr: '₹890 / mo',
      ciCover: 'Accidental Benefit only',
      smartExit: 'Standard Surrender',
    },
    {
      insurer: 'SBI Life Insurance',
      code: 'SBI_LIFE',
      csr: '97.05%',
      solvency: '2.15',
      avgSettlement: '4 Business Days',
      indicativeRate1Cr: '₹720 / mo',
      ciCover: 'Optional Rider',
      smartExit: 'Not Applicable',
    },
    {
      insurer: 'Tata AIA Life Insurance',
      code: 'TATA_AIA',
      csr: '99.01%',
      solvency: '1.88',
      avgSettlement: '3 Business Days',
      indicativeRate1Cr: '₹840 / mo',
      ciCover: 'Comprehensive Health Rider',
      smartExit: '105% ROP Variant',
    },
  ]

  return (
    <div className="space-y-16 lg:space-y-24 py-8 sm:py-12">
      {/* 1. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5F2] text-[#16856D] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>IRDAI Registered Direct Life Insurance Broker</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#142D4E] tracking-tight leading-[1.12] font-['Manrope']">
              Protect what matters. <br />
              <span className="text-[#16856D]">Make informed decisions.</span>
            </h1>

            <p className="text-lg text-[#687788] max-w-xl leading-relaxed">
              Explore life insurance options from multiple providers, understand your protection requirements and compare policies with clarity.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/assessment')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#16856D] hover:bg-[#0F6B57] text-white font-semibold text-base shadow-sm transition-all active:scale-[0.98]"
              >
                <Calculator className="w-5 h-5" />
                <span>Find the right coverage</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/compare"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-white border border-[#E2E8EF] hover:border-[#142D4E] text-[#142D4E] font-semibold text-base transition-colors shadow-2xs"
              >
                <Scale className="w-5 h-5 text-[#687788]" />
                <span>Compare policies</span>
              </Link>
            </div>

            {/* Fiduciary and Institutional Trust Badges */}
            <div className="pt-6 border-t border-[#E2E8EF] grid grid-cols-3 gap-6 text-xs">
              <div>
                <p className="font-extrabold text-[#142D4E] text-base font-['Manrope']">6 Authorised</p>
                <p className="text-[#687788] mt-0.5">Partner life insurers</p>
              </div>
              <div>
                <p className="font-extrabold text-[#142D4E] text-base font-['Manrope']">99.3% Average</p>
                <p className="text-[#687788] mt-0.5">Claim Settlement Ratio</p>
              </div>
              <div>
                <p className="font-extrabold text-[#142D4E] text-base font-['Manrope']">Zero Advisory Fee</p>
                <p className="text-[#687788] mt-0.5">100% free consumer guidance</p>
              </div>
            </div>
          </div>

          {/* Meaningful Interface Preview: Interactive Protection Estimator */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-[#E2E8EF] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8EF]">
                <div>
                  <h3 className="font-bold text-[#142D4E] font-['Manrope'] text-lg">
                    Coverage & Rate Estimator
                  </h3>
                  <p className="text-xs text-[#687788]">
                    Calculated via Human Life Value &bull; Demo rate cards
                  </p>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-[#E8F5F2] text-[#16856D] px-2.5 py-1 rounded">
                  Live Preview
                </span>
              </div>

              <div className="space-y-4 text-sm">
                {/* Age selector */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-[#182536]">Your Age</label>
                    <span className="text-xs font-bold text-[#142D4E]">{age} years</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[25, 30, 35, 42].map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setAge(a)}
                        className={`py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                          age === a
                            ? 'bg-[#142D4E] text-white border-[#142D4E]'
                            : 'bg-[#F7F9FB] text-[#182536] border-[#E2E8EF] hover:bg-white'
                        }`}
                      >
                        {a} yrs
                      </button>
                    ))}
                  </div>
                </div>

                {/* Annual Income */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-[#182536]">
                      Annual Household Income
                    </label>
                    <span className="text-xs font-bold text-[#142D4E]">
                      ₹{(annualIncome / 100000).toFixed(0)} Lakh
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { val: 1000000, label: '₹10L' },
                      { val: 1800000, label: '₹18L' },
                      { val: 2800000, label: '₹28L' },
                      { val: 4500000, label: '₹45L' },
                    ].map((inc) => (
                      <button
                        key={inc.val}
                        type="button"
                        onClick={() => setAnnualIncome(inc.val)}
                        className={`py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                          annualIncome === inc.val
                            ? 'bg-[#142D4E] text-white border-[#142D4E]'
                            : 'bg-[#F7F9FB] text-[#182536] border-[#E2E8EF] hover:bg-white'
                        }`}
                      >
                        {inc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dependents & Tobacco */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-[#182536] mb-1.5">
                      Dependents
                    </label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDependents(d)}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md border text-center transition-all ${
                            dependents === d
                              ? 'bg-[#16856D] text-white border-[#16856D]'
                              : 'bg-[#F7F9FB] text-[#182536] border-[#E2E8EF]'
                          }`}
                        >
                          {d} {d === 3 ? '+' : ''}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#182536] mb-1.5">
                      Tobacco / Smoking
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsSmoker(!isSmoker)}
                      className={`w-full py-1.5 text-xs font-medium rounded-md border text-center transition-all ${
                        isSmoker
                          ? 'bg-[#C58A36] text-white border-[#C58A36]'
                          : 'bg-[#F7F9FB] text-[#182536] border-[#E2E8EF]'
                      }`}
                    >
                      {isSmoker ? 'Smoker (Higher rate)' : 'Non-Smoker'}
                    </button>
                  </div>
                </div>

                {/* Live Estimator Output Panel */}
                <div className="p-4 rounded-xl bg-[#E8F5F2] border border-[#16856D]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#16856D] font-bold block uppercase tracking-wider">
                        Recommended Life Cover (HLV)
                      </span>
                      <span className="text-2xl font-black text-[#142D4E] font-['Manrope']">
                        {displayCover}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-[#687788] block">Starting from</span>
                      <span className="text-lg font-extrabold text-[#16856D] font-['Manrope']">
                        ₹{adjustedMonthly.toLocaleString('en-IN')}{' '}
                        <span className="text-xs font-normal text-[#687788]">/ mo</span>
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#687788] leading-tight">
                    Protection replacing ~12 years of income + mortgage debts. Calculated on verified partner rate cards.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/assessment')}
                className="w-full py-3 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>Complete In-Depth Needs Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-center text-[#687788]">
                *Premiums are indicative demo figures. Binding underwriting issued by carriers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Insurance Category Section (All 5 Categories) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#16856D]">
              Product Catalogue
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142D4E] font-['Manrope']">
              Life Insurance Categories Explained
            </h2>
            <p className="text-sm text-[#687788] max-w-2xl">
              Choose the right financial instrument for your specific life objective. We break down the differences transparently.
            </p>
          </div>

          <Link
            to="/insurance"
            className="text-sm font-semibold text-[#142D4E] hover:text-[#16856D] inline-flex items-center gap-1 transition-colors"
          >
            <span>Explore All 10+ Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INSURANCE_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-xl border border-[#E2E8EF] p-6 hover:shadow-md transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-[#E9F1F5] text-[#142D4E] px-2.5 py-1 rounded">
                    {cat.tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#142D4E] font-['Manrope']">
                  {cat.title}
                </h3>
                <p className="text-xs text-[#687788] leading-relaxed">{cat.desc}</p>
                <div className="pt-2 text-xs">
                  <span className="font-semibold text-[#182536] block">Best suited for:</span>
                  <p className="text-[#687788] mt-0.5">{cat.idealFor}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2E8EF] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#687788] block">Benchmark</span>
                  <span className="text-xs font-bold text-[#16856D]">
                    {cat.minRecommendedCover.split(' ')[0]} {cat.minRecommendedCover.split(' ')[1]}
                  </span>
                </div>
                <Link
                  to={`/insurance?category=${cat.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F7F9FB] text-xs font-semibold text-[#142D4E] hover:bg-[#142D4E] hover:text-white transition-colors"
                >
                  <span>View Plans</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. How FINCORE Works (The 4-Step Process) */}
      <section className="bg-white border-y border-[#E2E8EF] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#16856D]">
              Streamlined Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142D4E] font-['Manrope']">
              How the FINCORE Brokerage Platform Works
            </h2>
            <p className="text-sm text-[#687788]">
              From identifying your real protection deficit to receiving your verified policy schedule with lifetime claim advocacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Calculate Human Life Value',
                desc: 'Input your household income, dependents, liabilities, and education timelines into our scientific calculator to compute your exact coverage shortfall.',
                icon: Calculator,
              },
              {
                step: '02',
                title: 'Multi-Insurer Comparison',
                desc: 'Compare official policy wordings, claim settlement track records, and indicative premiums across India’s leading life insurers side-by-side.',
                icon: Scale,
              },
              {
                step: '03',
                title: 'Paperless Digital Proposal',
                desc: 'Submit statutory KYC documents securely. Our certified broker team coordinates video tele-medical interviews at your preferred schedule.',
                icon: FileCheck2,
              },
              {
                step: '04',
                title: 'Direct Issuance & Claims Concierge',
                desc: 'Your chosen insurer approves and issues the policy directly. FINCORE remains your family’s dedicated advocate for all future endorsements and claims.',
                icon: ShieldCheck,
              },
            ].map((st) => (
              <div
                key={st.step}
                className="p-6 rounded-xl border border-[#E2E8EF] bg-[#F7F9FB] flex flex-col justify-between space-y-4 hover:border-[#142D4E] transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-[#16856D] font-['Manrope']">
                      {st.step}
                    </span>
                    <st.icon className="w-5 h-5 text-[#142D4E]" />
                  </div>
                  <h3 className="text-base font-bold text-[#142D4E] font-['Manrope']">
                    {st.title}
                  </h3>
                  <p className="text-xs text-[#687788] leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Benefits of Using an Authorised Broker */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#142D4E] text-white rounded-2xl p-8 sm:p-12 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#16856D]">
                The Broker Advantage
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-['Manrope'] leading-tight">
                Why buy through an authorised broker rather than directly from one insurer?
              </h2>
              <p className="text-sm text-white/80 leading-relaxed">
                An insurance company agent can only advocate for their own company's products. As a licensed Direct Insurance Broker, FINCORE is legally mandated to represent you—the policyholder.
              </p>
              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16856D] hover:underline"
                >
                  <span>Learn more about broker regulatory obligations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <HeartHandshake className="w-5 h-5 text-[#16856D]" />
                <h4 className="font-bold font-['Manrope'] text-white">Fiduciary Duty to You</h4>
                <p className="text-xs text-white/70">
                  We are legally bound to protect the consumer’s interest, matching plans to your actual liabilities, not corporate sales quotas.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <Scale className="w-5 h-5 text-[#16856D]" />
                <h4 className="font-bold font-['Manrope'] text-white">Unbiased Multi-Insurer Choice</h4>
                <p className="text-xs text-white/70">
                  Compare pricing and coverage across HDFC Life, ICICI Pru, SBI Life, Max Life, LIC, and Tata AIA without platform prejudice.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <BadgeAlert className="w-5 h-5 text-[#16856D]" />
                <h4 className="font-bold font-['Manrope'] text-white">Exclusions Disclosed Upfront</h4>
                <p className="text-xs text-white/70">
                  We highlight critical illness waiting periods, suicide clauses, and occupational limitations so you avoid claim-time surprises.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <ShieldCheck className="w-5 h-5 text-[#16856D]" />
                <h4 className="font-bold font-['Manrope'] text-white">Dedicated Claims Concierge</h4>
                <p className="text-xs text-white/70">
                  In the event of a claim, our certified claims officers assist nominees through paperwork and carrier correspondence at ₹0 cost.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <Lock className="w-5 h-5 text-[#16856D]" />
                <h4 className="font-bold font-['Manrope'] text-white">Zero Telemarketing Spam</h4>
                <p className="text-xs text-white/70">
                  Your phone number is confidential. You will never receive unsolicited spam calls or be passed to third-party telemarketing call centers.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <Award className="w-5 h-5 text-[#16856D]" />
                <h4 className="font-bold font-['Manrope'] text-white">Strict Premium Parity</h4>
                <p className="text-xs text-white/70">
                  By law, premiums are exactly identical to direct insurer pricing. You receive independent advisory without paying an extra rupee.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Multi-Insurer Comparison Introduction Matrix */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#16856D]">
              Objective Market Overview
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142D4E] font-['Manrope'] mt-1">
              Top Life Insurer Comparison Matrix
            </h2>
            <p className="text-sm text-[#687788]">
              Published IRDAI metrics and indicative benchmark term rates (30-year-old healthy male, ₹1 Crore cover).
            </p>
          </div>

          <Link
            to="/compare"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#142D4E] text-white text-xs font-semibold hover:bg-[#1D3D5C] transition-colors"
          >
            <span>Launch Deep Side-by-Side Tool</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto rounded-xl border border-[#E2E8EF] bg-white shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9FB] border-b border-[#E2E8EF] text-[#142D4E] font-['Manrope']">
              <tr>
                <th className="py-3.5 px-4 font-bold">Life Insurance Company</th>
                <th className="py-3.5 px-4 font-bold">Claim Settlement (CSR)</th>
                <th className="py-3.5 px-4 font-bold">Solvency Ratio</th>
                <th className="py-3.5 px-4 font-bold">Average Settlement</th>
                <th className="py-3.5 px-4 font-bold">Indicative ₹1 Cr Rate</th>
                <th className="py-3.5 px-4 font-bold">Critical Illness Rider</th>
                <th className="py-3.5 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8EF] text-[#182536]">
              {partnerComparisonMatrix.map((item) => (
                <tr key={item.code} className="hover:bg-[#F7F9FB]/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#142D4E]">{item.insurer}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#16856D] bg-[#E8F5F2] px-2 py-0.5 rounded">
                      {item.csr}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium">{item.solvency} (Reg: &gt;1.50)</td>
                  <td className="py-3 px-4 text-[#687788]">{item.avgSettlement}</td>
                  <td className="py-3 px-4 font-bold text-[#142D4E]">{item.indicativeRate1Cr}</td>
                  <td className="py-3 px-4 text-[#687788]">{item.ciCover}</td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to="/compare"
                      className="text-xs font-semibold text-[#16856D] hover:underline"
                    >
                      Compare &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-[#687788]">
          *CSR figures are sourced from the IRDAI Annual Report 2023–24. Solvency ratios measure capital adequacy to meet policy obligations. Premiums shown are indicative benchmark rates.
        </p>
      </section>

      {/* 6. Educational Insurance Section */}
      <section className="bg-white border-y border-[#E2E8EF] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#16856D]">
              Knowledge Bureau
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142D4E] font-['Manrope']">
              Essential Life Insurance Concepts Every Buyer Must Know
            </h2>
            <p className="text-sm text-[#687788]">
              We believe in informed decisions over aggressive sales tactics. Learn the core principles that protect your family’s financial future.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl border border-[#E2E8EF] bg-[#F7F9FB] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#E8F5F2] text-[#16856D] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#142D4E] font-['Manrope']">
                1. Pure Risk vs. Investment
              </h3>
              <p className="text-xs text-[#687788] leading-relaxed">
                Mixing life cover with investment often yields inadequate protection and suboptimal returns. Always secure your core term cover (15x–20x income) first before allocating surplus funds into market instruments.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#E2E8EF] bg-[#F7F9FB] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#E8F5F2] text-[#16856D] flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#142D4E] font-['Manrope']">
                2. Human Life Value (HLV)
              </h3>
              <p className="text-xs text-[#687788] leading-relaxed">
                HLV calculates the exact present value of all future earnings you would provide to your family until retirement, minus your personal consumption. It ensures debt repayment and children's college goals are met.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#E2E8EF] bg-[#F7F9FB] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#E8F5F2] text-[#16856D] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#142D4E] font-['Manrope']">
                3. Section 45 Incontestability
              </h3>
              <p className="text-xs text-[#687788] leading-relaxed">
                Under Section 45 of the Insurance Act, after a policy completes 3 continuous years from issuance or revival, no insurer can reject a claim on any grounds, including alleged non-disclosure. Honesty upfront guarantees safety.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#E2E8EF] bg-[#F7F9FB] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#E8F5F2] text-[#16856D] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#142D4E] font-['Manrope']">
                4. 30-Day Free Look Window
              </h3>
              <p className="text-xs text-[#687788] leading-relaxed">
                You hold a statutory 30-day window upon receiving electronic policy documents to review policy wordings, riders, and exclusions. If unsatisfied, you can cancel for a prompt refund of paid premiums.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Customer FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#16856D]">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142D4E] font-['Manrope']">
            Clear Answers to Common Questions
          </h2>
          <p className="text-sm text-[#687788]">
            Everything you need to know about purchasing life insurance through an authorised broker.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-[#E2E8EF] rounded-xl bg-white overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-sm text-[#142D4E] hover:text-[#16856D] transition-colors"
              >
                <span>{faq.q}</span>
                {openFaqIndex === idx ? (
                  <ChevronUp className="w-4 h-4 text-[#16856D] flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#687788] flex-shrink-0" />
                )}
              </button>

              {openFaqIndex === idx && (
                <div className="px-5 pb-5 pt-1 text-xs text-[#687788] leading-relaxed border-t border-[#E2E8EF]/50">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. Final Conversion CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-[#E9F1F5] rounded-2xl border border-[#E2E8EF] p-8 sm:p-12 text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142D4E] font-['Manrope']">
            Ready to find the ideal protection for your family?
          </h2>
          <p className="text-sm text-[#687788] max-w-xl mx-auto leading-relaxed">
            Take our 2-minute scientific insurance assessment, calculate your Human Life Value, and contrast multi-insurer policy wordings side-by-side.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/assessment')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#16856D] hover:bg-[#0F6B57] text-white font-semibold text-sm transition-all shadow-sm active:scale-[0.98]"
            >
              <Calculator className="w-4 h-4" />
              <span>Start Free Needs Assessment</span>
            </button>
            <Link
              to="/compare"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-white border border-[#E2E8EF] text-[#142D4E] font-semibold text-sm hover:border-[#142D4E] transition-colors"
            >
              <Scale className="w-4 h-4 text-[#687788]" />
              <span>Compare Top Insurers</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
