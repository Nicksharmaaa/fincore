import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Calculator,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  FileCheck,
  Save,
  RotateCcw,
  AlertCircle,
  TrendingUp,
  Landmark,
  GraduationCap,
  Scale,
  PhoneCall,
  ChevronRight,
  Info,
} from 'lucide-react'
import {
  calculateCoverageGapAPI,
  submitCustomerEnquiryAPI,
  fetchProductsAPI,
  type QuickCalculationResult,
} from '../../../services/api'
import { PRODUCTS_CATALOG, type ProductItem } from '../data/products'
import { EnquiryModal, type EnquiryType } from '../../../components/EnquiryModal'

const STORAGE_KEY = 'fincore_assessment_draft'

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState<number>(1)
  const [saveToast, setSaveToast] = useState<string | null>(null)

  // Step 1: Basic Profile
  const [age, setAge] = useState<number>(32)
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male')
  const [maritalStatus, setMaritalStatus] = useState<'Married' | 'Single'>('Married')
  const [isSmoker, setIsSmoker] = useState<boolean>(false)
  const [city, setCity] = useState<string>('Mumbai')
  const [pincode, setPincode] = useState<string>('400051')

  // Step 2: Income Range and Occupation
  const [annualIncome, setAnnualIncome] = useState<number>(1800000) // ₹18 Lakhs
  const [employmentType, setEmploymentType] = useState<string>('Salaried Corporate')
  const [industry, setIndustry] = useState<string>('Technology & IT Services')

  // Step 3: Family and Financial Dependents
  const [dependentsCount, setDependentsCount] = useState<number>(2)
  const [childrenCount, setChildrenCount] = useState<number>(1)
  const [spouseDependent, setSpouseDependent] = useState<boolean>(true)
  const [elderlyParentsDependent, setElderlyParentsDependent] = useState<boolean>(true)

  // Step 4: Existing Life Insurance Coverage
  const [existingTermCover, setExistingTermCover] = useState<number>(5000000) // ₹50 Lakhs
  const [existingTradCover, setExistingTradCover] = useState<number>(500000) // ₹5 Lakhs (LIC/Endowment)
  const [employerGroupCover, setEmployerGroupCover] = useState<number>(3000000) // ₹30 Lakhs
  const [countEmployerCover, setCountEmployerCover] = useState<boolean>(false) // Default NO because job change voids employer cover

  // Step 5: Financial Responsibilities and Liabilities
  const [homeLoanOutstanding, setHomeLoanOutstanding] = useState<number>(4500000) // ₹45 Lakhs
  const [otherLoans, setOtherLoans] = useState<number>(500000) // ₹5 Lakhs
  const [monthlyHouseholdExpenses, setMonthlyHouseholdExpenses] = useState<number>(75000)
  const [childEducationNeed, setChildEducationNeed] = useState<number>(2500000) // ₹25 Lakhs

  // Step 6: Insurance Objectives
  const [objectives, setObjectives] = useState<string[]>([
    'Income Replacement for Family',
    'Debt & Home Loan Clearance',
  ])

  // Step 7: Budget and Duration Preferences
  const [preferredCoverAge, setPreferredCoverAge] = useState<number>(75)
  const [premiumDuration, setPremiumDuration] = useState<'Regular' | '10-Pay' | '5-Pay'>('Regular')
  const [targetMonthlyBudget, setTargetMonthlyBudget] = useState<number>(2500)

  // Step 8: Customer Lead Intake & Consent
  const [customerName, setCustomerName] = useState<string>('')
  const [customerEmail, setCustomerEmail] = useState<string>('')
  const [customerPhone, setCustomerPhone] = useState<string>('')
  const [consentGiven, setConsentGiven] = useState<boolean>(true)

  // Calculation & Results State
  const [isCalculating, setIsCalculating] = useState<boolean>(false)
  const [calcResult, setCalcResult] = useState<QuickCalculationResult | null>(null)
  const [recommendedProducts, setRecommendedProducts] = useState<ProductItem[]>([])

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<EnquiryType>('QUOTE_REQUEST')
  const [activeProduct, setActiveProduct] = useState<ProductItem | null>(null)

  // Load saved draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.age) setAge(parsed.age)
        if (parsed.gender) setGender(parsed.gender)
        if (parsed.maritalStatus) setMaritalStatus(parsed.maritalStatus)
        if (parsed.isSmoker !== undefined) setIsSmoker(parsed.isSmoker)
        if (parsed.city) setCity(parsed.city)
        if (parsed.annualIncome) setAnnualIncome(parsed.annualIncome)
        if (parsed.employmentType) setEmploymentType(parsed.employmentType)
        if (parsed.dependentsCount !== undefined) setDependentsCount(parsed.dependentsCount)
        if (parsed.childrenCount !== undefined) setChildrenCount(parsed.childrenCount)
        if (parsed.existingTermCover !== undefined) setExistingTermCover(parsed.existingTermCover)
        if (parsed.existingTradCover !== undefined) setExistingTradCover(parsed.existingTradCover)
        if (parsed.homeLoanOutstanding !== undefined) setHomeLoanOutstanding(parsed.homeLoanOutstanding)
        if (parsed.childEducationNeed !== undefined) setChildEducationNeed(parsed.childEducationNeed)
        if (parsed.preferredCoverAge) setPreferredCoverAge(parsed.preferredCoverAge)
        if (parsed.step && parsed.step < 9) setStep(parsed.step)
      }
    } catch (e) {
      // Ignore parse errors
    }
  }, [])

  // Auto-save draft on step change
  const handleSaveDraft = () => {
    const draft = {
      step,
      age,
      gender,
      maritalStatus,
      isSmoker,
      city,
      pincode,
      annualIncome,
      employmentType,
      industry,
      dependentsCount,
      childrenCount,
      spouseDependent,
      elderlyParentsDependent,
      existingTermCover,
      existingTradCover,
      employerGroupCover,
      countEmployerCover,
      homeLoanOutstanding,
      otherLoans,
      monthlyHouseholdExpenses,
      childEducationNeed,
      objectives,
      preferredCoverAge,
      premiumDuration,
      targetMonthlyBudget,
      customerName,
      customerEmail,
      customerPhone,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    setSaveToast('Draft saved successfully to local storage.')
    setTimeout(() => setSaveToast(null), 3000)
  }

  const handleResetDraft = () => {
    localStorage.removeItem(STORAGE_KEY)
    setStep(1)
    setSaveToast('Assessment reset to standard defaults.')
    setTimeout(() => setSaveToast(null), 3000)
  }

  // Calculate live values
  const totalLiabilities = homeLoanOutstanding + otherLoans
  const totalExistingCover = existingTermCover + existingTradCover + (countEmployerCover ? employerGroupCover : 0)
  const totalEducationFund = childrenCount > 0 ? childEducationNeed * childrenCount : 0

  // Format currency helpers
  const formatINR = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Crore`
    }
    return `₹${(val / 100000).toFixed(1)} Lakh`
  }

  // Trigger calculation and transition to results (Step 9)
  const handleRunAssessment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsCalculating(true)

    const calculationInput = {
      annual_income: annualIncome,
      dependents_count: dependentsCount,
      outstanding_liabilities: totalLiabilities,
      existing_cover: totalExistingCover,
      education_fund_target: totalEducationFund,
      occupation: employmentType,
      is_smoker: isSmoker,
      preferred_coverage_age: preferredCoverAge,
    }

    try {
      // 1. Call Backend Calculate API
      const result = await calculateCoverageGapAPI(calculationInput)
      setCalcResult(result)

      // 2. If customer info was provided, also save to backend lead enquiry
      if (customerName.trim() && customerEmail.trim() && customerPhone.trim()) {
        await submitCustomerEnquiryAPI({
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim(),
          customer_phone: customerPhone.trim(),
          city,
          enquiry_type: 'ASSESSMENT_SUBMISSION',
          product_interest: `Term Life Cover ${formatINR(result.coverage_gap)}`,
          desired_sum_assured: result.coverage_gap,
          consent_given: consentGiven,
          lead_source: 'WEBSITE_ASSESSMENT',
          assessment_data: {
            ...calculationInput,
            age,
            gender,
            city,
            pincode,
            monthly_expenses: monthlyHouseholdExpenses,
            objectives,
          },
        })
      }

      // 3. Load matching products from backend catalogue
      const products = await fetchProductsAPI(result.recommended_category.toLowerCase().includes('term') ? 'term' : 'savings')
      setRecommendedProducts(products.slice(0, 3))

      // Move to step 9 (Results)
      setStep(9)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('Error during assessment calculation:', err)
    } finally {
      setIsCalculating(false)
    }
  }

  const stepsList = [
    { num: 1, label: 'Profile' },
    { num: 2, label: 'Income' },
    { num: 3, label: 'Family' },
    { num: 4, label: 'Current Cover' },
    { num: 5, label: 'Liabilities' },
    { num: 6, label: 'Objectives' },
    { num: 7, label: 'Preferences' },
    { num: 8, label: 'Review & Submit' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg bg-[#142D4E] text-white text-xs font-semibold shadow-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#16856D]" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5F2] text-[#16856D] text-xs font-semibold">
          <Calculator className="w-3.5 h-3.5" />
          <span>Scientific Human Life Value (HLV) Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#142D4E] font-['Manrope']">
          Comprehensive Insurance Needs Assessment
        </h1>
        <p className="text-sm text-[#687788] max-w-xl mx-auto">
          Under-insurance is the single largest financial risk facing Indian households. Compute your precise family protection shortfall across 8 key financial dimensions.
        </p>

        {/* Action Toolbar */}
        <div className="flex items-center justify-center gap-3 pt-2 text-xs">
          <button
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8EF] text-[#687788] hover:text-[#142D4E] hover:bg-white transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
          <button
            onClick={handleResetDraft}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8EF] text-[#687788] hover:text-[#C44545] hover:bg-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 8-Step Interactive Progress Tracker */}
      {step < 9 && (
        <div className="bg-white rounded-xl border border-[#E2E8EF] p-4 shadow-2xs">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center text-[11px] font-semibold">
            {stepsList.map((s) => (
              <button
                key={s.num}
                onClick={() => setStep(s.num)}
                className={`flex flex-col items-center gap-1.5 p-1 rounded-lg transition-all ${
                  step === s.num
                    ? 'text-[#142D4E] font-bold'
                    : step > s.num
                    ? 'text-[#16856D]'
                    : 'text-[#687788] opacity-70 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                    step === s.num
                      ? 'bg-[#142D4E] text-white shadow-xs'
                      : step > s.num
                      ? 'bg-[#16856D] text-white'
                      : 'bg-[#E9F1F5] text-[#687788]'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </div>
                <span className="truncate w-full">{s.label}</span>
              </button>
            ))}
          </div>
          <div className="w-full bg-[#E9F1F5] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-[#16856D] h-full transition-all duration-300"
              style={{ width: `${(step / 8) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Multi-Step Container Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8EF] p-6 sm:p-10 shadow-sm">
        {/* ============================================================ */}
        {/* STEP 1: Basic Profile */}
        {/* ============================================================ */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="border-b border-[#E2E8EF] pb-4">
              <span className="text-xs font-bold text-[#16856D] uppercase tracking-wider block">
                Step 1 of 8: Actuarial Demographics
              </span>
              <h2 className="text-xl font-bold text-[#142D4E] font-['Manrope'] mt-1">
                Your Basic Demographics & Mortality Factors
              </h2>
              <p className="text-xs text-[#687788] mt-1">
                Age and nicotine usage are the primary actuarial determinants of life insurance premium rates across Indian life insurers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Age Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-[#182536]">
                  <span>Current Age</span>
                  <span className="text-[#142D4E] font-bold text-sm">{age} years</span>
                </div>
                <input
                  type="range"
                  min="21"
                  max="65"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full accent-[#142D4E]"
                />
                <div className="flex justify-between text-[10px] text-[#687788]">
                  <span>21 yrs (Lowest Premium)</span>
                  <span>40 yrs</span>
                  <span>65 yrs</span>
                </div>
              </div>

              {/* Gender Radio */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#182536] block">Biological Gender</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Male', 'Female', 'Other'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                        gender === g
                          ? 'border-[#142D4E] bg-[#142D4E] text-white shadow-2xs'
                          : 'border-[#E2E8EF] text-[#687788] hover:border-[#142D4E]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#687788]">
                  Female lives typically enjoy a 10%–15% discount on pure term premiums due to higher life expectancy tables.
                </p>
              </div>

              {/* Tobacco / Smoking Status */}
              <div className="space-y-2 sm:col-span-2 p-4 rounded-xl border border-[#E2E8EF] bg-[#F7F9FB]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#142D4E] block">
                      Tobacco / Nicotine Usage in the Last 24 Months
                    </span>
                    <p className="text-[11px] text-[#687788] mt-0.5">
                      Includes cigarettes, bidis, cigars, gutkha, nicotine gums, or vapes. Non-smokers receive standard base rates.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsSmoker(false)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold border ${
                        !isSmoker
                          ? 'bg-[#16856D] text-white border-[#16856D]'
                          : 'border-[#E2E8EF] text-[#687788] bg-white'
                      }`}
                    >
                      Non-Smoker
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSmoker(true)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold border ${
                        isSmoker
                          ? 'bg-[#C44545] text-white border-[#C44545]'
                          : 'border-[#E2E8EF] text-[#687788] bg-white'
                      }`}
                    >
                      Smoker / Tobacco
                    </button>
                  </div>
                </div>
              </div>

              {/* City and Pincode */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#182536] block">City of Residence</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8EF] text-xs focus:border-[#142D4E] outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#182536] block">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8EF] text-xs focus:border-[#142D4E] outline-hidden"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-[#E2E8EF] flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white text-xs font-semibold transition-colors"
              >
                <span>Continue to Income & Occupation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: Income Range and Occupation */}
        {/* ============================================================ */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="border-b border-[#E2E8EF] pb-4">
              <span className="text-xs font-bold text-[#16856D] uppercase tracking-wider block">
                Step 2 of 8: Earning Capacity
              </span>
              <h2 className="text-xl font-bold text-[#142D4E] font-['Manrope'] mt-1">
                Income Range and Professional Occupation
              </h2>
              <p className="text-xs text-[#687788] mt-1">
                Financial underwriting limits your maximum permitted sum assured to a multiple (10x–25x) of your documented gross income.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs font-semibold text-[#182536] mb-2">
                  <span>Gross Annual Income (Pre-tax INR)</span>
                  <span className="text-[#16856D] font-bold text-sm">
                    {formatINR(annualIncome)} / year
                  </span>
                </div>
                <input
                  type="range"
                  min="400000"
                  max="10000000"
                  step="100000"
                  value={annualIncome}
                  onChange={(e) => setAnnualIncome(Number(e.target.value))}
                  className="w-full accent-[#16856D]"
                />
                <div className="flex justify-between text-[10px] text-[#687788] mt-1">
                  <span>₹4 Lakh</span>
                  <span>₹25 Lakh</span>
                  <span>₹50 Lakh</span>
                  <span>₹1 Crore+</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#182536] block mb-1">
                    Employment Classification
                  </label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8EF] text-xs bg-white focus:border-[#142D4E] outline-hidden"
                  >
                    <option value="Salaried Corporate">Salaried (MNC / Listed Corporate)</option>
                    <option value="Salaried Government">Salaried (Govt / PSU)</option>
                    <option value="Self-Employed Professional">Self-Employed Professional (Doctor, CA, Lawyer)</option>
                    <option value="Business Owner">Business Owner / Partner</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#182536] block mb-1">
                    Primary Industry Sector
                  </label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8EF] text-xs focus:border-[#142D4E] outline-hidden"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#E8F5F2] border border-[#16856D]/30 text-xs text-[#182536] flex items-start gap-3">
                <Info className="w-4 h-4 text-[#16856D] mt-0.5 shrink-0" />
                <p>
                  <strong>Human Life Value Rule:</strong> At age {age}, insurers typically sanction between <strong>15x to 20x</strong> of your annual income as maximum permitted term cover (approximately {formatINR(annualIncome * 18)}).
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E2E8EF] flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E2E8EF] text-xs font-semibold text-[#687788] hover:text-[#182536]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white text-xs font-semibold transition-colors"
              >
                <span>Continue to Dependents</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: Family and Financial Dependents */}
        {/* ============================================================ */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="border-b border-[#E2E8EF] pb-4">
              <span className="text-xs font-bold text-[#16856D] uppercase tracking-wider block">
                Step 3 of 8: Family Structure
              </span>
              <h2 className="text-xl font-bold text-[#142D4E] font-['Manrope'] mt-1">
                Family & Financial Dependents
              </h2>
              <p className="text-xs text-[#687788] mt-1">
                Whose daily living and educational requirements depend on your uninterrupted monthly income?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-[#182536]">
                  <span>Total Financial Dependents</span>
                  <span className="text-[#142D4E] font-bold text-sm">{dependentsCount} People</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={dependentsCount}
                  onChange={(e) => setDependentsCount(Number(e.target.value))}
                  className="w-full accent-[#142D4E]"
                />
                <div className="flex justify-between text-[10px] text-[#687788]">
                  <span>0 (Self only)</span>
                  <span>2</span>
                  <span>4</span>
                  <span>6+</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-[#182536]">
                  <span>Number of Children</span>
                  <span className="text-[#16856D] font-bold text-sm">{childrenCount}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  value={childrenCount}
                  onChange={(e) => setChildrenCount(Number(e.target.value))}
                  className="w-full accent-[#16856D]"
                />
                <div className="flex justify-between text-[10px] text-[#687788]">
                  <span>0</span>
                  <span>1</span>
                  <span>2</span>
                  <span>3+</span>
                </div>
              </div>

              <div className="sm:col-span-2 space-y-3 pt-2">
                <label className="text-xs font-semibold text-[#182536] block">
                  Additional Dependent Obligations
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="p-3 rounded-lg border border-[#E2E8EF] flex items-center gap-2 cursor-pointer hover:bg-[#F7F9FB]">
                    <input
                      type="checkbox"
                      checked={spouseDependent}
                      onChange={(e) => setSpouseDependent(e.target.checked)}
                      className="accent-[#142D4E]"
                    />
                    <span>Spouse is financially dependent</span>
                  </label>
                  <label className="p-3 rounded-lg border border-[#E2E8EF] flex items-center gap-2 cursor-pointer hover:bg-[#F7F9FB]">
                    <input
                      type="checkbox"
                      checked={elderlyParentsDependent}
                      onChange={(e) => setElderlyParentsDependent(e.target.checked)}
                      className="accent-[#142D4E]"
                    />
                    <span>Dependent elderly parents living with you</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E2E8EF] flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E2E8EF] text-xs font-semibold text-[#687788] hover:text-[#182536]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(4)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white text-xs font-semibold transition-colors"
              >
                <span>Continue to Existing Cover</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 4: Existing Life Insurance Coverage */}
        {/* ============================================================ */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="border-b border-[#E2E8EF] pb-4">
              <span className="text-xs font-bold text-[#16856D] uppercase tracking-wider block">
                Step 4 of 8: Baseline Protection
              </span>
              <h2 className="text-xl font-bold text-[#142D4E] font-['Manrope'] mt-1">
                Existing Life Insurance Policies
              </h2>
              <p className="text-xs text-[#687788] mt-1">
                Do not double-count insurance. Enter all policies currently active in your name.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs font-semibold text-[#182536] mb-2">
                  <span>Existing Individual Term Insurance Cover</span>
                  <span className="text-[#142D4E] font-bold text-sm">
                    {formatINR(existingTermCover)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30000000"
                  step="500000"
                  value={existingTermCover}
                  onChange={(e) => setExistingTermCover(Number(e.target.value))}
                  className="w-full accent-[#142D4E]"
                />
                <div className="flex justify-between text-[10px] text-[#687788] mt-1">
                  <span>₹0 (None)</span>
                  <span>₹50 Lakh</span>
                  <span>₹1.5 Crore</span>
                  <span>₹3 Crore+</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-[#182536] mb-2">
                  <span>Existing Traditional / LIC / Endowment Sum Assured</span>
                  <span className="text-[#142D4E] font-bold text-sm">
                    {formatINR(existingTradCover)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000000"
                  step="100000"
                  value={existingTradCover}
                  onChange={(e) => setExistingTradCover(Number(e.target.value))}
                  className="w-full accent-[#142D4E]"
                />
              </div>

              {/* Employer Group Cover Callout */}
              <div className="p-4 rounded-xl border border-[#E2E8EF] bg-[#F7F9FB] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-[#142D4E] block">
                      Corporate Employer Group Term Life Cover (GTL)
                    </span>
                    <span className="text-[#687788] text-[11px]">
                      Currently covered: {formatINR(employerGroupCover)}
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#182536]">
                    <input
                      type="checkbox"
                      checked={countEmployerCover}
                      onChange={(e) => setCountEmployerCover(e.target.checked)}
                      className="accent-[#16856D]"
                    />
                    <span>Count toward existing cover</span>
                  </label>
                </div>
                <p className="text-[10px] text-[#C58A36] leading-relaxed bg-[#FFFBEB] p-2 rounded border border-[#C58A36]/20">
                  <strong>Broker Advisory Note:</strong> Financial planners advise against relying solely on corporate insurance because it ceases immediately upon resignation, job loss, or retirement when fresh cover becomes prohibitively expensive.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#E8F5F2] text-xs flex justify-between font-semibold text-[#16856D]">
                <span>Recognized Baseline Coverage:</span>
                <span>{formatINR(totalExistingCover)}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E2E8EF] flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E2E8EF] text-xs font-semibold text-[#687788] hover:text-[#182536]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(5)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white text-xs font-semibold transition-colors"
              >
                <span>Continue to Liabilities</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 5: Financial Responsibilities & Liabilities */}
        {/* ============================================================ */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="border-b border-[#E2E8EF] pb-4">
              <span className="text-xs font-bold text-[#16856D] uppercase tracking-wider block">
                Step 5 of 8: Liabilities & Commitments
              </span>
              <h2 className="text-xl font-bold text-[#142D4E] font-['Manrope'] mt-1">
                Debt Clearances & Child Milestone Targets
              </h2>
              <p className="text-xs text-[#687788] mt-1">
                In unfortunate events, outstanding loans must not burden surviving dependents or compromise children’s professional higher education.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs font-semibold text-[#182536] mb-2">
                  <span>Outstanding Home Loan Balance (INR)</span>
                  <span className="text-[#C44545] font-bold text-sm">
                    {formatINR(homeLoanOutstanding)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15000000"
                  step="500000"
                  value={homeLoanOutstanding}
                  onChange={(e) => setHomeLoanOutstanding(Number(e.target.value))}
                  className="w-full accent-[#C44545]"
                />
                <div className="flex justify-between text-[10px] text-[#687788] mt-1">
                  <span>₹0 (Debt-free)</span>
                  <span>₹50 Lakh</span>
                  <span>₹1 Crore</span>
                  <span>₹1.5 Crore+</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-[#182536] mb-2">
                  <span>Target Higher Education & Marriage Fund (Per child)</span>
                  <span className="text-[#142D4E] font-bold text-sm">
                    {formatINR(childEducationNeed)}
                  </span>
                </div>
                <input
                  type="range"
                  min="500000"
                  max="7500000"
                  step="500000"
                  value={childEducationNeed}
                  onChange={(e) => setChildEducationNeed(Number(e.target.value))}
                  className="w-full accent-[#142D4E]"
                />
                <div className="flex justify-between text-[10px] text-[#687788] mt-1">
                  <span>₹5 Lakh</span>
                  <span>₹25 Lakh</span>
                  <span>₹50 Lakh</span>
                  <span>₹75 Lakh</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-[#182536] mb-2">
                  <span>Current Monthly Household Running Expenses</span>
                  <span className="text-[#142D4E] font-bold text-sm">
                    ₹{monthlyHouseholdExpenses.toLocaleString('en-IN')} / month
                  </span>
                </div>
                <input
                  type="range"
                  min="25000"
                  max="250000"
                  step="5000"
                  value={monthlyHouseholdExpenses}
                  onChange={(e) => setMonthlyHouseholdExpenses(Number(e.target.value))}
                  className="w-full accent-[#142D4E]"
                />
              </div>

              <div className="p-4 rounded-xl bg-[#F7F9FB] border border-[#E2E8EF] text-xs flex justify-between font-semibold">
                <span className="text-[#687788]">Total Financial Commitments Protected:</span>
                <span className="text-[#142D4E]">{formatINR(totalLiabilities + totalEducationFund)}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E2E8EF] flex justify-between">
              <button
                onClick={() => setStep(4)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E2E8EF] text-xs font-semibold text-[#687788] hover:text-[#182536]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(6)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white text-xs font-semibold transition-colors"
              >
                <span>Continue to Objectives</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 6: Insurance Objectives */}
        {/* ============================================================ */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="border-b border-[#E2E8EF] pb-4">
              <span className="text-xs font-bold text-[#16856D] uppercase tracking-wider block">
                Step 6 of 8: Priority Strategy
              </span>
              <h2 className="text-xl font-bold text-[#142D4E] font-['Manrope'] mt-1">
                Your Primary Insurance Objectives
              </h2>
              <p className="text-xs text-[#687788] mt-1">
                Select all outcomes you want your insurance portfolio to guarantee for your dependents.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                {
                  id: 'Income Replacement for Family',
                  title: 'Pure Family Income Replacement',
                  desc: 'Replace annual earnings so family maintains current lifestyle without compromise.',
                },
                {
                  id: 'Debt & Home Loan Clearance',
                  title: 'Debt & Home Loan Clearance',
                  desc: 'Immediate lump sum to extinguish bank mortgages and car loans.',
                },
                {
                  id: 'Child Higher Education Guarantee',
                  title: 'Guaranteed Child Education Fund',
                  desc: 'Ring-fence funds for college degrees even if parent is not around.',
                },
                {
                  id: 'Critical Illness Medical Protection',
                  title: 'Critical Illness & Disability Rider',
                  desc: 'Lump-sum payout upon diagnosis of cancer, stroke, or heart attack.',
                },
                {
                  id: 'Retirement Annuity Pension',
                  title: 'Guaranteed Lifetime Annuity',
                  desc: 'Monthly pension for surviving spouse in retirement years.',
                },
                {
                  id: 'Whole Life Legacy Transfer',
                  title: 'Legacy Wealth Transfer (Up to Age 100)',
                  desc: 'Pass on an untaxed estate inheritance to next generation.',
                },
              ].map((obj) => {
                const isSelected = objectives.includes(obj.id)
                return (
                  <div
                    key={obj.id}
                    onClick={() => {
                      if (isSelected) {
                        setObjectives(objectives.filter((o) => o !== obj.id))
                      } else {
                        setObjectives([...objectives, obj.id])
                      }
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#16856D] bg-[#E8F5F2]/40 shadow-xs'
                        : 'border-[#E2E8EF] hover:border-[#142D4E] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#142D4E]">{obj.title}</span>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center border text-[10px] ${
                          isSelected
                            ? 'bg-[#16856D] text-white border-[#16856D]'
                            : 'border-[#E2E8EF]'
                        }`}
                      >
                        {isSelected && '✓'}
                      </div>
                    </div>
                    <p className="text-[11px] text-[#687788]">{obj.desc}</p>
                  </div>
                )
              })}
            </div>

            <div className="pt-6 border-t border-[#E2E8EF] flex justify-between">
              <button
                onClick={() => setStep(5)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E2E8EF] text-xs font-semibold text-[#687788] hover:text-[#182536]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(7)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white text-xs font-semibold transition-colors"
              >
                <span>Continue to Preferences</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 7: Budget and Duration Preferences */}
        {/* ============================================================ */}
        {step === 7 && (
          <div className="space-y-6">
            <div className="border-b border-[#E2E8EF] pb-4">
              <span className="text-xs font-bold text-[#16856D] uppercase tracking-wider block">
                Step 7 of 8: Policy Terms
              </span>
              <h2 className="text-xl font-bold text-[#142D4E] font-['Manrope'] mt-1">
                Coverage Duration & Premium Payment Tenure
              </h2>
              <p className="text-xs text-[#687788] mt-1">
                Align policy maturity with your planned retirement age or mortgage amortization schedule.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-[#182536] block mb-2">
                  Target Coverage Age
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[65, 75, 85, 100].map((tAge) => (
                    <button
                      key={tAge}
                      type="button"
                      onClick={() => setPreferredCoverAge(tAge)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        preferredCoverAge === tAge
                          ? 'border-[#142D4E] bg-[#142D4E] text-white font-bold shadow-2xs'
                          : 'border-[#E2E8EF] text-[#687788] hover:border-[#142D4E] bg-white'
                      }`}
                    >
                      <span className="text-sm block">{tAge === 100 ? 'Whole Life' : `${tAge} Yrs`}</span>
                      <span className="text-[10px] opacity-80 block">
                        {tAge === 65 ? 'Retirement' : tAge === 75 ? 'Recommended' : tAge === 85 ? 'Extended' : 'Age 100'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#182536] block mb-2">
                  Premium Payment Structure
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'Regular', title: 'Regular Pay', sub: 'Pay throughout coverage duration' },
                    { id: '10-Pay', title: '10-Year Limited Pay', sub: 'Pay for 10 years, stay covered till 75' },
                    { id: '5-Pay', title: '5-Year Limited Pay', sub: 'Finish premiums early during peak earning' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPremiumDuration(p.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        premiumDuration === p.id
                          ? 'border-[#16856D] bg-[#E8F5F2] text-[#142D4E]'
                          : 'border-[#E2E8EF] text-[#687788] bg-white'
                      }`}
                    >
                      <span className="text-xs font-bold block">{p.title}</span>
                      <span className="text-[10px] text-[#687788] block mt-1">{p.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-[#182536] mb-2">
                  <span>Target Monthly Insurance Budget</span>
                  <span className="text-[#16856D] font-bold text-sm">
                    ₹{targetMonthlyBudget.toLocaleString('en-IN')} / month
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="15000"
                  step="250"
                  value={targetMonthlyBudget}
                  onChange={(e) => setTargetMonthlyBudget(Number(e.target.value))}
                  className="w-full accent-[#16856D]"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-[#E2E8EF] flex justify-between">
              <button
                onClick={() => setStep(6)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E2E8EF] text-xs font-semibold text-[#687788] hover:text-[#182536]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(8)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white text-xs font-semibold transition-colors"
              >
                <span>Review & Submit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 8: Review and Submit (Consent & Lead Intake) */}
        {/* ============================================================ */}
        {step === 8 && (
          <form onSubmit={handleRunAssessment} className="space-y-6">
            <div className="border-b border-[#E2E8EF] pb-4">
              <span className="text-xs font-bold text-[#16856D] uppercase tracking-wider block">
                Step 8 of 8: Verification & Consent
              </span>
              <h2 className="text-xl font-bold text-[#142D4E] font-['Manrope'] mt-1">
                Review Your Declared Assessment Figures
              </h2>
              <p className="text-xs text-[#687788] mt-1">
                Verify the numbers below before generating your institutional Human Life Value coverage gap dossier.
              </p>
            </div>

            {/* Summary Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-[#E2E8EF] bg-[#F7F9FB]">
                <span className="text-[#687788] block text-[10px]">Annual Income</span>
                <span className="font-bold text-[#142D4E] text-sm mt-0.5 block">
                  {formatINR(annualIncome)}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-[#E2E8EF] bg-[#F7F9FB]">
                <span className="text-[#687788] block text-[10px]">Dependents</span>
                <span className="font-bold text-[#142D4E] text-sm mt-0.5 block">
                  {dependentsCount} Members
                </span>
              </div>
              <div className="p-3 rounded-lg border border-[#E2E8EF] bg-[#F7F9FB]">
                <span className="text-[#687788] block text-[10px]">Outstanding Debt</span>
                <span className="font-bold text-[#C44545] text-sm mt-0.5 block">
                  {formatINR(totalLiabilities)}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-[#E2E8EF] bg-[#F7F9FB]">
                <span className="text-[#687788] block text-[10px]">Existing Coverage</span>
                <span className="font-bold text-[#16856D] text-sm mt-0.5 block">
                  {formatINR(totalExistingCover)}
                </span>
              </div>
            </div>

            {/* Inbound Lead Information */}
            <div className="p-4 rounded-xl border border-[#E2E8EF] bg-white space-y-3">
              <h4 className="text-xs font-bold text-[#142D4E] font-['Manrope']">
                Contact Details for Official Assessment Dossier Delivery
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-[#182536] block mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Vikram Sethi"
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8EF] focus:border-[#16856D] outline-hidden text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#182536] block mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91-98200-XXXXX"
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8EF] focus:border-[#16856D] outline-hidden text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#182536] block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="vikram@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8EF] focus:border-[#16856D] outline-hidden text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Statutory DPDP Consent */}
            <div className="p-3.5 rounded-xl bg-[#E8F5F2] border border-[#16856D]/20 text-[11px] leading-relaxed">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-0.5 accent-[#16856D]"
                />
                <span className="text-[#182536]">
                  <strong>Digital Personal Data Protection (DPDP) Act Consent:</strong> I authorize FINCORE (Authorised Direct Insurance Broker) to securely evaluate my declared financial liabilities and life requirements, compute my Human Life Value shortfall, and share verified quotation alternatives. Zero spam or cold calling guarantee.
                </span>
              </label>
            </div>

            <div className="pt-6 border-t border-[#E2E8EF] flex justify-between">
              <button
                type="button"
                onClick={() => setStep(7)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E2E8EF] text-xs font-semibold text-[#687788] hover:text-[#182536]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={isCalculating}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#16856D] hover:bg-[#0F6B57] text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
              >
                {isCalculating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Actuarial Assessment...</span>
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4" />
                    <span>Generate Coverage Gap Dossier &rarr;</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* STEP 9: RESULTS & PRODUCT RECOMMENDATIONS */}
        {/* ============================================================ */}
        {step === 9 && calcResult && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2 border-b border-[#E2E8EF] pb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5F2] text-[#16856D] text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Assessment Generated Successfully</span>
              </span>
              <h2 className="text-3xl font-extrabold text-[#142D4E] font-['Manrope']">
                Your Family’s Coverage Gap Analysis
              </h2>
              <p className="text-xs text-[#687788] max-w-lg mx-auto">
                Computed via the actuarial Human Life Value (HLV) methodology: Income replacement buffer + Liabilities clearance + Educational targets minus existing active coverage.
              </p>
            </div>

            {/* Gap Highlight Hero Card */}
            <div className="bg-[#142D4E] text-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-md">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center border-b border-white/10 pb-6">
                <div>
                  <span className="text-xs text-white/60 block">Total Protection Requirement</span>
                  <span className="text-xl sm:text-2xl font-extrabold text-white font-['Manrope'] mt-1 block">
                    {formatINR(calcResult.calculated_hlv)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-white/60 block">Existing Active Coverage</span>
                  <span className="text-xl sm:text-2xl font-extrabold text-[#E8F5F2] font-['Manrope'] mt-1 block">
                    {formatINR(calcResult.existing_cover)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#16856D] font-bold block uppercase tracking-wider">
                    Uninsured Coverage Shortfall
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-[#16856D] font-['Manrope'] mt-1 block">
                    {formatINR(calcResult.coverage_gap)}
                  </span>
                </div>
              </div>

              {/* Explanations & Assumptions */}
              <div className="space-y-3 text-xs text-white/80 leading-relaxed">
                <h4 className="font-bold text-white text-sm">Underwriting Assumptions & Mathematical Factors:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-white/60 block">1. Income Replacement</span>
                    <strong className="text-white block mt-0.5">
                      {formatINR(calcResult.income_protection_needed)}
                    </strong>
                    <span className="text-white/70 block mt-1">12x annual income ({formatINR(annualIncome)}) to fund family living expenses.</span>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-white/60 block">2. Debt Clearance Buffer</span>
                    <strong className="text-white block mt-0.5">
                      {formatINR(calcResult.liabilities_protection)}
                    </strong>
                    <span className="text-white/70 block mt-1">Immediate liquidation of home mortgages and personal borrowings.</span>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-white/60 block">3. Child Milestone Funds</span>
                    <strong className="text-white block mt-0.5">
                      {formatINR(calcResult.family_goals_protection)}
                    </strong>
                    <span className="text-white/70 block mt-1">Higher professional education funds for {childrenCount} children.</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white/10 text-[11px] text-white/75 flex items-center gap-2">
                <Info className="w-4 h-4 text-[#16856D] shrink-0" />
                <span>
                  <strong>Statutory Notice:</strong> {calcResult.disclaimer} Final sum assured eligibility and premium loading depend on medical underwriting and carrier financial review.
                </span>
              </div>
            </div>

            {/* Recommended Products Catalogue Section */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#142D4E] font-['Manrope']">
                    Recommended Multi-Carrier Policies Covering {formatINR(calcResult.coverage_gap)}
                  </h3>
                  <p className="text-xs text-[#687788]">
                    Selected from IRDAI authorised insurers with 98%+ Claim Settlement Ratios matching your age ({age}) and shortfall.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/compare')}
                  className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#16856D] hover:underline"
                >
                  <Scale className="w-4 h-4" />
                  <span>Compare All in Engine &rarr;</span>
                </button>
              </div>

              {/* Product Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(recommendedProducts.length > 0 ? recommendedProducts : PRODUCTS_CATALOG.slice(0, 3)).map((prod) => (
                  <div
                    key={prod.id}
                    className="p-5 rounded-xl border border-[#E2E8EF] bg-white hover:border-[#142D4E] transition-all flex flex-col justify-between space-y-4 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-[#16856D] bg-[#E8F5F2] px-2 py-0.5 rounded">
                          {prod.claimSettlementRatio} CSR
                        </span>
                        <span className="text-[10px] font-mono text-[#687788] bg-[#F7F9FB] px-1.5 py-0.5 rounded border border-[#E2E8EF]">
                          {prod.uinNumber}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#142D4E] font-['Manrope']">{prod.name}</h4>
                      <p className="text-xs text-[#687788] mt-0.5">{prod.insurer}</p>

                      <div className="mt-3 pt-3 border-t border-[#E2E8EF] space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#687788]">Indicative Premium:</span>
                          <span className="font-bold text-[#142D4E]">
                            ₹{prod.startingPremiumMonthly.toLocaleString('en-IN')}/mo
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#687788]">Max Cover Age:</span>
                          <span className="font-semibold text-[#182536]">{prod.maturityAge}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        onClick={() => {
                          setActiveProduct(prod)
                          setModalType('QUOTE_REQUEST')
                          setModalOpen(true)
                        }}
                        className="w-full py-2 rounded-lg bg-[#16856D] hover:bg-[#0F6B57] text-white text-xs font-semibold transition-colors"
                      >
                        Request Official Quote
                      </button>
                      <button
                        onClick={() => navigate(`/compare?p1=${prod.id}`)}
                        className="w-full py-1.5 rounded-lg border border-[#E2E8EF] hover:bg-[#F7F9FB] text-xs font-semibold text-[#687788] hover:text-[#182536] transition-colors"
                      >
                        Compare Side-by-Side
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-6 rounded-xl border border-[#E2E8EF] bg-[#F7F9FB] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-[#142D4E] font-['Manrope']">
                  Need a Certified Insurance Broker to Review Your Assessment?
                </h4>
                <p className="text-xs text-[#687788] mt-0.5">
                  Our licensed advisors provide zero-commission bias recommendations and help with medical scheduling.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setActiveProduct(null)
                    setModalType('CALLBACK_REQUEST')
                    setModalOpen(true)
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Request Priority Callback</span>
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="px-3 py-2 rounded-lg border border-[#E2E8EF] text-xs font-semibold text-[#687788] hover:text-[#182536] whitespace-nowrap"
                >
                  Modify Inputs
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enquiry Modal */}
      <EnquiryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        enquiryType={modalType}
        productName={activeProduct?.name || 'Comprehensive Term Protection'}
        insurerName={activeProduct?.insurer || 'Broker Partner Carrier'}
        productId={activeProduct?.id}
        desiredSumAssured={calcResult?.coverage_gap || 10000000}
        assessmentData={
          calcResult
            ? {
                annual_income: annualIncome,
                dependents_count: dependentsCount,
                outstanding_liabilities: totalLiabilities,
                existing_cover: totalExistingCover,
                education_fund_target: totalEducationFund,
                calculated_hlv: calcResult.calculated_hlv,
                coverage_gap: calcResult.coverage_gap,
                age,
                city,
                is_smoker: isSmoker,
              }
            : undefined
        }
      />
    </div>
  )
}
