export interface SpecimenDocument {
  id: string
  title: string
  type: 'brochure' | 'policy_wording' | 'cis' | 'claim_form'
  fileSize: string
  format: string
  isDemo: boolean
}

export interface ProductItem {
  id: string
  name: string
  insurer: string
  insurerCode: string
  uinNumber: string
  category: 'term' | 'whole_life' | 'savings' | 'ulip' | 'retirement'
  categoryLabel: string
  tagline: string
  version: string
  effectiveDate: string
  claimSettlementRatio: string
  startingPremiumMonthly: number
  indicativeSumAssured: string
  entryAge: string
  maturityAge: string
  policyTerm: string
  premiumPaymentTerm: string
  keyBenefits: string[]
  ridersAvailable: string[]
  exclusions: string[]
  specimenDocuments: SpecimenDocument[]
  description: string
  eligibilityNotes: string
  isDemoData: boolean
}

export const INSURANCE_CATEGORIES = [
  {
    id: 'term',
    title: 'Term Life Insurance',
    tag: 'Essential Protection',
    desc: 'High financial cover at minimal premium cost. Provides pure risk protection ensuring your family’s lifestyle, home loans, and children’s education goals remain secure against unforeseen loss of life.',
    idealFor: 'Primary breadwinners, individuals with mortgages, young parents, and working professionals seeking maximum cover per rupee.',
    minRecommendedCover: '15x – 20x annual household income',
  },
  {
    id: 'whole_life',
    title: 'Whole Life Insurance',
    tag: 'Legacy & Lifelong Cover',
    desc: 'Provides comprehensive death benefit coverage extending up to age 99 or 100. Combines risk protection with long-term legacy transfer to heirs, ensuring a guaranteed financial heritage for the next generation.',
    idealFor: 'Affluent individuals planning intergenerational wealth transfer, estate liquidity, or perpetual family protection.',
    minRecommendedCover: '₹1 Crore to ₹10 Crore estate legacy fund',
  },
  {
    id: 'savings',
    title: 'Savings & Endowment Products',
    tag: 'Capital Protection',
    desc: 'Traditional non-linked, non-participating plans offering guaranteed returns and capital protection immune to stock market volatility. Provides predictable cash flows for milestone financial commitments.',
    idealFor: 'Conservative savers funding specific milestones like higher education fees (5–10 year horizon) or daughter’s marriage.',
    minRecommendedCover: 'Guaranteed lump sum or fixed annual income stream',
  },
  {
    id: 'ulip',
    title: 'Unit Linked Insurance Plans (ULIPs)',
    tag: 'Wealth Creation',
    desc: 'Dual-benefit instruments integrating life insurance protection with market-linked investment portfolios across equity, debt, and balanced funds, with tax-exempt switching under Section 10(10D) limits.',
    idealFor: 'Disciplined long-term investors seeking wealth accumulation with a 10–15 year horizon who also desire inbuilt term cover.',
    minRecommendedCover: '10x annualized premium cover + fund growth',
  },
  {
    id: 'retirement',
    title: 'Retirement & Annuity Products',
    tag: 'Guaranteed Pension',
    desc: 'Guaranteed lifelong pension annuities ensuring you never outlive your retirement corpus. Delivers predictable monthly, quarterly, or annual payouts backed by life insurance balance sheets.',
    idealFor: 'Pre-retirees and retirees (aged 45–75) looking to convert accumulated savings into guaranteed inflation-resilient cash flow.',
    minRecommendedCover: 'Guaranteed monthly annuity for life with return of purchase price to nominees',
  },
]

export const PRODUCTS_CATALOG: ProductItem[] = [
  // 1. Term Insurance
  {
    id: 'hdfc-click-2-protect',
    name: 'Click 2 Protect Super',
    insurer: 'HDFC Life Insurance',
    insurerCode: 'HDFC_LIFE',
    uinNumber: '101N145V02',
    category: 'term',
    categoryLabel: 'Term Life Insurance',
    tagline: 'Comprehensive pure risk protection with smart exit milestone refunds',
    version: 'v4.2 (2025 Revised)',
    effectiveDate: '01-Jan-2025',
    claimSettlementRatio: '99.50%',
    startingPremiumMonthly: 780,
    indicativeSumAssured: '₹1 Crore',
    entryAge: '18 - 65 Years',
    maturityAge: 'Up to 85 Years',
    policyTerm: '10 - 45 Years',
    premiumPaymentTerm: 'Regular Pay / Limited Pay (5, 10, 12 yrs)',
    keyBenefits: [
      '100% lump-sum death benefit payout with optional structured monthly income for nominees',
      'Accelerated Terminal Illness benefit: early payout of up to ₹1 Crore on terminal medical prognosis',
      'Smart Exit Option: surrender policy at age 60 and receive 100% of all premiums paid back',
      'Life Stage Protection: option to step-up sum assured by 50% on marriage and 25% on childbirth without fresh medical underwriting',
    ],
    ridersAvailable: [
      'Critical Illness Plus Rider (covers 64 specified critical illnesses)',
      'Accidental Total & Permanent Disability Rider (lump sum + waiver of future premiums)',
      'Accidental Death Benefit Rider (additional 100% sum assured payout)',
    ],
    exclusions: [
      'Suicide clause: demise within 12 months from policy inception results in 80% premium refund, not full death benefit',
      'War, invasion, civil commotion, or active participation in military warfare',
      'Engaging in hazardous sports (motor racing, deep-sea diving, mountaineering) unless specifically declared and rated',
      'Non-disclosure or intentional misrepresentation of pre-existing cardiovascular or cancer history',
    ],
    specimenDocuments: [
      { id: 'doc-hdfc-brochure', title: 'HDFC Life C2P Super Product Brochure', type: 'brochure', fileSize: '1.8 MB', format: 'PDF', isDemo: true },
      { id: 'doc-hdfc-wording', title: 'Policy Terms & Specimen Contract (v4.2)', type: 'policy_wording', fileSize: '840 KB', format: 'PDF', isDemo: true },
      { id: 'doc-hdfc-cis', title: 'Customer Information Sheet (IRDAI Format)', type: 'cis', fileSize: '320 KB', format: 'PDF', isDemo: true },
    ],
    description:
      'HDFC Life Click 2 Protect Super is a benchmark term life plan designed for dynamic life protection. It offers policyholders the flexibility to vary death benefit structures, add comprehensive critical illness protection, and exercise an exit option to reclaim paid premiums at retirement.',
    eligibilityNotes: 'Requires valid PAN, Aadhaar address verification, and 3-year ITR (income proof) for sum assured above ₹1 Crore.',
    isDemoData: true,
  },
  {
    id: 'icici-iprotect-smart',
    name: 'iProtect Smart',
    insurer: 'ICICI Prudential Life',
    insurerCode: 'ICICI_PRU',
    uinNumber: '105N151V07',
    category: 'term',
    categoryLabel: 'Term Life Insurance',
    tagline: 'Enhanced protection covering 34 critical illnesses with zero hospital bill requirement',
    version: 'v3.8 (2024)',
    effectiveDate: '15-Aug-2024',
    claimSettlementRatio: '99.17%',
    startingPremiumMonthly: 810,
    indicativeSumAssured: '₹1 Crore',
    entryAge: '18 - 65 Years',
    maturityAge: 'Up to 99 Years (Whole Life Option)',
    policyTerm: '5 - 67 Years',
    premiumPaymentTerm: 'Regular Pay / Pay till 60 / Limited Pay (5, 7, 10 yrs)',
    keyBenefits: [
      'Dual payout option: lump-sum immediate cash plus monthly income over 10 years to prevent nominee fund depletion',
      'Accelerated Critical Illness benefit paid upon initial verified medical diagnosis (no hospital invoices required)',
      'Inbuilt Waiver of Premium on Accidental Total & Permanent Disability',
      'Preferential discounted premium rates for women and non-tobacco users',
    ],
    ridersAvailable: [
      'Accidental Death Benefit Rider (up to ₹2 Crore additional cover)',
      'Critical Illness Cover (covers 34 critical illnesses including heart attack, stroke, and organ failure)',
    ],
    exclusions: [
      'Self-inflicted injury or suicide within the initial policy year',
      'Pre-existing critical illness conditions diagnosed within the 90-day waiting period from inception',
      'Substance abuse or narcotics consumption other than under registered medical practitioner care',
    ],
    specimenDocuments: [
      { id: 'doc-icici-brochure', title: 'ICICI Pru iProtect Smart Brochure', type: 'brochure', fileSize: '2.1 MB', format: 'PDF', isDemo: true },
      { id: 'doc-icici-wording', title: 'Specimen Policy Wording (IRDAI Approved)', type: 'policy_wording', fileSize: '910 KB', format: 'PDF', isDemo: true },
    ],
    description:
      'ICICI Pru iProtect Smart combines pure risk protection with living benefits. The accelerated critical illness coverage delivers cash payouts directly to the insured during their lifetime upon diagnosis, shielding personal savings from exorbitant medical costs.',
    eligibilityNotes: 'Tele-medical consultation required for sum assured > ₹50 Lakh. Mandatory salary slip or Form 16 verification.',
    isDemoData: true,
  },
  {
    id: 'lic-tech-term',
    name: 'Tech Term (Plan 854)',
    insurer: 'Life Insurance Corporation (LIC)',
    insurerCode: 'LIC_INDIA',
    uinNumber: '512N333V02',
    category: 'term',
    categoryLabel: 'Term Life Insurance',
    tagline: 'Pure risk term plan directly backed by sovereign safety under Section 37 of LIC Act',
    version: 'Plan 854 (2024 Revision)',
    effectiveDate: '01-Jan-2024',
    claimSettlementRatio: '98.50%',
    startingPremiumMonthly: 890,
    indicativeSumAssured: '₹1 Crore',
    entryAge: '18 - 65 Years',
    maturityAge: 'Up to 80 Years',
    policyTerm: '10 - 40 Years',
    premiumPaymentTerm: 'Regular Pay / Limited Pay (5 or 10 yrs) / Single Pay',
    keyBenefits: [
      'Unsurpassed sovereign backing: sum assured and claims backed by the Government of India guarantee',
      'High Sum Assured rebates offering lower rates for coverage of ₹1 Crore and ₹2 Crore+',
      'Level or Increasing Sum Assured option (increases 10% annually after 5th policy year)',
      'Flexible death benefit settlement options in annual or monthly installments over 5, 10 or 15 years',
    ],
    ridersAvailable: [
      'LIC Accident Benefit Rider (provides additional lump sum equal to sum assured on accidental demise)',
    ],
    exclusions: [
      'Suicide within 12 months from the date of commencement of risk or date of revival',
      'Demise due to participating in breach of penal law with criminal intent',
    ],
    specimenDocuments: [
      { id: 'doc-lic-brochure', title: 'LIC Tech Term Plan 854 Brochure', type: 'brochure', fileSize: '1.4 MB', format: 'PDF', isDemo: true },
      { id: 'doc-lic-wording', title: 'Statutory Policy Schedule & Clauses', type: 'policy_wording', fileSize: '650 KB', format: 'PDF', isDemo: true },
    ],
    description:
      'LIC Tech Term is an exclusive online term plan from the state-owned insurer. It provides substantial life cover with the highest level of sovereign reliability in India, paired with preferential non-smoker premium brackets.',
    eligibilityNotes: 'Exclusively available through online direct and digital broker channels. Requires 3-year audited financial records or Form 16.',
    isDemoData: true,
  },

  // 2. Whole Life Insurance
  {
    id: 'max-life-whole-life',
    name: 'Smart Whole Life Supreme',
    insurer: 'Max Life Insurance',
    insurerCode: 'MAX_LIFE',
    uinNumber: '104N122V02',
    category: 'whole_life',
    categoryLabel: 'Whole Life Insurance',
    tagline: 'Lifelong financial protection up to age 100 with guaranteed estate legacy',
    version: 'v2.4 (2025)',
    effectiveDate: '10-Jan-2025',
    claimSettlementRatio: '99.51%',
    startingPremiumMonthly: 2150,
    indicativeSumAssured: '₹1 Crore',
    entryAge: '18 - 60 Years',
    maturityAge: 'Age 100 Years',
    policyTerm: 'Up to Age 100',
    premiumPaymentTerm: 'Pay till age 60 / Limited Pay (10, 15, 20 yrs)',
    keyBenefits: [
      'Guaranteed life cover running until the policyholder turns 100 years of age',
      'Survival Endowment: if the insured survives to age 100, the full basic sum assured is paid as a maturity bonus',
      'Limited premium payment options allowing policyholders to finish all payments during peak working years',
      'Enables structured inheritance and liquidity for family estate planning',
    ],
    ridersAvailable: [
      'Max Life Comprehensive Accidental Rider',
      'Max Life Waiver of Premium Plus Rider',
    ],
    exclusions: [
      'Suicide within 12 months from inception or revival',
      'Civil commotion, active participation in riots, or war',
    ],
    specimenDocuments: [
      { id: 'doc-max-wl-brochure', title: 'Max Life Whole Life Supreme Product Deck', type: 'brochure', fileSize: '2.4 MB', format: 'PDF', isDemo: true },
      { id: 'doc-max-wl-wording', title: 'Policy Terms Document (v2.4)', type: 'policy_wording', fileSize: '780 KB', format: 'PDF', isDemo: true },
    ],
    description:
      'Max Life Smart Whole Life Supreme is engineered for individuals who desire permanent insurance cover rather than term policies that expire at age 75 or 85. It guarantees a financial legacy for children and grandchildren regardless of when death occurs.',
    eligibilityNotes: 'Standard medical examination required for all applicants over age 40. Minimum sum assured ₹50 Lakh.',
    isDemoData: true,
  },
  {
    id: 'tata-sampoorna-whole-life',
    name: 'Sampoorna Raksha Whole Life',
    insurer: 'Tata AIA Life Insurance',
    insurerCode: 'TATA_AIA',
    uinNumber: '110N160V03',
    category: 'whole_life',
    categoryLabel: 'Whole Life Insurance',
    tagline: 'Centennial protection up to age 100 with 105% return of premium variant',
    version: 'v5.1 (2024)',
    effectiveDate: '10-Oct-2024',
    claimSettlementRatio: '99.01%',
    startingPremiumMonthly: 1950,
    indicativeSumAssured: '₹1 Crore',
    entryAge: '18 - 65 Years',
    maturityAge: 'Age 100 Years',
    policyTerm: 'Up to Age 100',
    premiumPaymentTerm: 'Limited Pay: 5, 10, 12, 15 yrs or Pay till 60',
    keyBenefits: [
      'Protection extends until age 100, ensuring nominees receive guaranteed tax-free sum assured',
      'Option for 105% Return of Premium upon survival to maturity age',
      'Early Stage Cancer and Vitality health wellness rewards for maintaining active physical health',
      'Inbuilt Terminal Illness cover accelerating up to 50% sum assured',
    ],
    ridersAvailable: [
      'Tata AIA Vitality Protect (Accidental Death + Disability)',
      'Comprehensive Health & Critical Illness Add-on',
    ],
    exclusions: [
      'Suicide clause within initial 12 months',
      'Active military or naval service during declared international conflict',
    ],
    specimenDocuments: [
      { id: 'doc-tata-brochure', title: 'Tata AIA Sampoorna Raksha Brochure', type: 'brochure', fileSize: '1.9 MB', format: 'PDF', isDemo: true },
    ],
    description:
      'Tata AIA Sampoorna Raksha Whole Life combines comprehensive risk cover with century-long validity. It ensures your family receives capital protection whenever needed while incentivizing preventative healthcare through discounted renewals.',
    eligibilityNotes: 'Available to salaried and self-employed individuals with minimum ₹5 Lakh verifiable annual income.',
    isDemoData: true,
  },

  // 3. Savings & Endowment
  {
    id: 'max-smart-wealth-goal',
    name: 'Smart Wealth Goal',
    insurer: 'Max Life Insurance',
    insurerCode: 'MAX_LIFE',
    uinNumber: '104N118V04',
    category: 'savings',
    categoryLabel: 'Savings & Endowment',
    tagline: 'Guaranteed tax-free income with maturity booster additions for milestone goals',
    version: 'v3.0 (2025)',
    effectiveDate: '01-Feb-2025',
    claimSettlementRatio: '99.51%',
    startingPremiumMonthly: 4166,
    indicativeSumAssured: '₹50 Lakh',
    entryAge: '0 - 60 Years',
    maturityAge: 'Up to 85 Years',
    policyTerm: '10 - 25 Years',
    premiumPaymentTerm: '5, 8, 10, or 12 Years',
    keyBenefits: [
      '100% contractual capital guarantee: returns are legally guaranteed at policy inception and insulated from market drops',
      'Guaranteed Regular Payout: choose annual payouts for 10, 15, 20 or 25 years post premium payment term',
      'Lump-sum Booster Addition paid at the end of the premium payment duration',
      'Life cover of 10x annualized premium maintained continuously throughout the policy tenure',
    ],
    ridersAvailable: [
      'Max Life Waiver of Premium Plus Rider',
      'Accidental Death and Dismemberment Rider',
    ],
    exclusions: [
      'Suicide clause within the first policy year',
      'Pre-existing health condition concealment during proposal filing',
    ],
    specimenDocuments: [
      { id: 'doc-max-swg-brochure', title: 'Max Life Smart Wealth Goal Brochure', type: 'brochure', fileSize: '2.2 MB', format: 'PDF', isDemo: true },
      { id: 'doc-max-swg-wording', title: 'Specimen Policy Wording and Benefit Tables', type: 'policy_wording', fileSize: '850 KB', format: 'PDF', isDemo: true },
    ],
    description:
      'Max Life Smart Wealth Goal provides guaranteed capital safety and fixed cashflow. It is ideal for families funding structured milestones such as children’s undergraduate degrees, business seed capital, or predictable supplementary retirement cashflows.',
    eligibilityNotes: 'Available for juvenile lives (from age 90 days) with parent as proposer. Minimum annual premium ₹50,000.',
    isDemoData: true,
  },
  {
    id: 'hdfc-sanchay-plus',
    name: 'Sanchay Plus Guaranteed Income',
    insurer: 'HDFC Life Insurance',
    insurerCode: 'HDFC_LIFE',
    uinNumber: '101N134V06',
    category: 'savings',
    categoryLabel: 'Savings & Endowment',
    tagline: 'Long-term guaranteed income stream up to age 99 with full capital return',
    version: 'v6.1 (2024)',
    effectiveDate: '01-May-2024',
    claimSettlementRatio: '99.50%',
    startingPremiumMonthly: 5000,
    indicativeSumAssured: '₹60 Lakh',
    entryAge: '5 - 60 Years',
    maturityAge: 'Up to 99 Years',
    policyTerm: '10 - 40 Years',
    premiumPaymentTerm: '5, 6, 8, 10, or 12 Years',
    keyBenefits: [
      'Guaranteed Income option paying fixed income for 25 to 30 years',
      'Life Long Income variant paying guaranteed annuity up to age 99, followed by 100% return of total premiums paid to nominee',
      'Life cover of 10.5x annualized premium active throughout the policy duration',
      'Tax-free income under Section 10(10D) for eligible premium thresholds',
    ],
    ridersAvailable: [
      'HDFC Life Income Benefit on Accidental Disability Rider',
      'HDFC Life Critical Illness Rider',
    ],
    exclusions: [
      'Suicide within 12 months from inception results in 80% premium return',
    ],
    specimenDocuments: [
      { id: 'doc-hdfc-sp-brochure', title: 'HDFC Life Sanchay Plus Brochure', type: 'brochure', fileSize: '1.7 MB', format: 'PDF', isDemo: true },
    ],
    description:
      'HDFC Life Sanchay Plus is an industry-leading non-participating savings plan. It guarantees a locked-in tax-efficient yield unaffected by long-term interest rate declines in the Indian economy.',
    eligibilityNotes: 'Standard KYC documentation required. Medical scrutiny waived for standard profiles below age 45.',
    isDemoData: true,
  },

  // 4. ULIPs (Unit Linked Insurance Plans)
  {
    id: 'icici-pru-signature',
    name: 'Signature Wealth ULIP',
    insurer: 'ICICI Prudential Life',
    insurerCode: 'ICICI_PRU',
    uinNumber: '105L177V03',
    category: 'ulip',
    categoryLabel: 'Unit Linked Insurance Plan (ULIP)',
    tagline: 'Zero premium allocation charges with unlimited free fund switches across equity & debt',
    version: 'v3.2 (2025)',
    effectiveDate: '01-Jan-2025',
    claimSettlementRatio: '99.17%',
    startingPremiumMonthly: 4166,
    indicativeSumAssured: '₹50 Lakh',
    entryAge: '0 - 60 Years',
    maturityAge: 'Up to 80 Years',
    policyTerm: '10 - 30 Years',
    premiumPaymentTerm: 'Regular Pay / Limited Pay (5, 7, 10 yrs) / Single Pay',
    keyBenefits: [
      'Zero Premium Allocation Charges: 100% of your premium is directly invested in chosen fund units',
      'Return of Mortality Charges: all mortality deductions are refunded back into the fund at maturity',
      'Choice of 16 funds ranging from bluechip large-cap equity to corporate debt and liquid portfolios',
      'Unlimited free online fund switching allowing tax-free dynamic asset reallocation',
    ],
    ridersAvailable: [
      'Unit Linked Accidental Death Rider',
    ],
    exclusions: [
      'Suicide within 12 months: fund value as on date of intimation is paid to nominee',
      'Market risk is borne by the policyholder; unit values fluctuate with NAV',
    ],
    specimenDocuments: [
      { id: 'doc-icici-sig-brochure', title: 'ICICI Pru Signature Product Deck', type: 'brochure', fileSize: '2.5 MB', format: 'PDF', isDemo: true },
      { id: 'doc-icici-fund-factsheet', title: 'Monthly Fund Performance Factsheet', type: 'cis', fileSize: '1.2 MB', format: 'PDF', isDemo: true },
    ],
    description:
      'ICICI Pru Signature is a new-generation unit-linked life insurance product that eliminates legacy allocation fees. It pairs institutional-grade equity exposure with a safety net of mortality charge refunds upon survival to maturity.',
    eligibilityNotes: 'Suitability assessment mandatory under IRDAI investment product disclosure guidelines. 5-year lock-in period applies.',
    isDemoData: true,
  },
  {
    id: 'sbi-ewealth-royale',
    name: 'eWealth Royale',
    insurer: 'SBI Life Insurance',
    insurerCode: 'SBI_LIFE',
    uinNumber: '111L124V02',
    category: 'ulip',
    categoryLabel: 'Unit Linked Insurance Plan (ULIP)',
    tagline: 'Automated portfolio asset allocation with loyalty additions from 10th year',
    version: 'v2.0 (2024)',
    effectiveDate: '15-Jul-2024',
    claimSettlementRatio: '97.05%',
    startingPremiumMonthly: 3333,
    indicativeSumAssured: '₹40 Lakh',
    entryAge: '5 - 55 Years',
    maturityAge: 'Up to 70 Years',
    policyTerm: '10, 15, 20, 25, 30 Years',
    premiumPaymentTerm: 'Limited Pay (5, 7, 10 yrs) or Regular Pay',
    keyBenefits: [
      'Automatic asset rebalancing strategy protecting gains as policy nears maturity date',
      'Guaranteed Loyalty Additions credited into fund starting from the end of the 10th policy year',
      'Zero policy administration fees throughout the policy term',
      'Partial withdrawals permitted post 5-year statutory lock-in period',
    ],
    ridersAvailable: [
      'SBI Life - Accidental Death Benefit Rider',
    ],
    exclusions: [
      'Market fluctuations are borne by policyholder; NAV values reflect underlying equity and bond prices',
      'Suicide within 12 months from policy risk commencement',
    ],
    specimenDocuments: [
      { id: 'doc-sbi-ulip-brochure', title: 'SBI Life eWealth Royale Brochure', type: 'brochure', fileSize: '1.8 MB', format: 'PDF', isDemo: true },
    ],
    description:
      'SBI Life eWealth Royale is designed for disciplined investors aiming to build long-term wealth through equity and debt allocation with the added peace of mind of institutional asset governance.',
    eligibilityNotes: '5-year statutory lock-in period mandated by IRDAI. Minimum annual premium ₹40,000.',
    isDemoData: true,
  },

  // 5. Retirement & Annuity
  {
    id: 'hdfc-smart-pension-plus',
    name: 'Smart Pension Plus Annuity',
    insurer: 'HDFC Life Insurance',
    insurerCode: 'HDFC_LIFE',
    uinNumber: '101N155V01',
    category: 'retirement',
    categoryLabel: 'Retirement & Annuity',
    tagline: 'Guaranteed lifelong pension with return of purchase price to family nominees',
    version: 'v1.4 (2025)',
    effectiveDate: '01-Jan-2025',
    claimSettlementRatio: '99.50%',
    startingPremiumMonthly: 8333,
    indicativeSumAssured: '₹10 Lakh Purchase Price',
    entryAge: '30 - 85 Years',
    maturityAge: 'Whole Life (Lifelong)',
    policyTerm: 'Lifelong Annuity',
    premiumPaymentTerm: 'Single Premium / Deferred Pay',
    keyBenefits: [
      'Guaranteed lifelong regular pension rate locked in at inception: never drops even if bank rates fall',
      'Joint Life Option: pension continues to spouse after demise of primary annuitant',
      '100% Return of Purchase Price: entire corpus paid back to children/nominees upon demise of annuitant(s)',
      'Deferment flexibility: defer annuity from 1 to 10 years to lock in substantially higher payout rates',
    ],
    ridersAvailable: [
      'Critical Illness Booster on Annuity Option',
    ],
    exclusions: [
      'Suicide within 12 months: full purchase price is refunded to nominee',
      'No medical underwriting required for immediate annuity variants',
    ],
    specimenDocuments: [
      { id: 'doc-hdfc-annuity-brochure', title: 'HDFC Life Smart Pension Plus Brochure', type: 'brochure', fileSize: '2.0 MB', format: 'PDF', isDemo: true },
      { id: 'doc-hdfc-annuity-calculator', title: 'Standard Annuity Rate Slabs (2025)', type: 'cis', fileSize: '450 KB', format: 'PDF', isDemo: true },
    ],
    description:
      'HDFC Life Smart Pension Plus is a single-premium immediate or deferred annuity plan. It enables retirees to exchange an accumulated lump sum (such as EPF or NPS gratuity) for a guaranteed lifelong monthly pension that cannot be depleted by market crashes.',
    eligibilityNotes: 'Available to individuals aged 30 to 85. Direct conversion from NPS/superannuation schemes supported.',
    isDemoData: true,
  },
  {
    id: 'lic-jeevan-shanti',
    name: 'New Jeevan Shanti (Plan 858)',
    insurer: 'Life Insurance Corporation (LIC)',
    insurerCode: 'LIC_INDIA',
    uinNumber: '512N338V04',
    category: 'retirement',
    categoryLabel: 'Retirement & Annuity',
    tagline: 'Single premium deferred annuity plan with guaranteed addition rates from LIC',
    version: 'Plan 858 (2024)',
    effectiveDate: '01-Apr-2024',
    claimSettlementRatio: '98.50%',
    startingPremiumMonthly: 10000,
    indicativeSumAssured: '₹12 Lakh Purchase Price',
    entryAge: '30 - 79 Years',
    maturityAge: 'Whole Life',
    policyTerm: 'Lifelong post Deferment',
    premiumPaymentTerm: 'Single Premium',
    keyBenefits: [
      'Guaranteed addition rates credited monthly during the deferment period',
      'Higher annuity rates for purchase price of ₹5 Lakh and above',
      'Liquidity through loan facility after completion of 3 months from inception',
      'Joint life deferred annuity covers both spouses with 100% pension continuity',
    ],
    ridersAvailable: [],
    exclusions: [
      'Surrender value subject to regulatory lock-in and statutory surrender formula',
    ],
    specimenDocuments: [
      { id: 'doc-lic-shanti-brochure', title: 'LIC New Jeevan Shanti Plan 858 Brochure', type: 'brochure', fileSize: '1.6 MB', format: 'PDF', isDemo: true },
    ],
    description:
      'LIC New Jeevan Shanti is an annuity plan backed by the Government of India guarantee under Section 37 of the LIC Act. It offers deferred annuity rates that provide security against long-term longevity risk.',
    eligibilityNotes: 'Single premium minimum ₹1,50,000. No upper limit on purchase price.',
    isDemoData: true,
  },
]
